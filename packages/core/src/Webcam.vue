<template>
  <card-wrapper title="Webcam">
    <template slot="description">
      Love on the beat
    </template>
    <div class="webcam">
    <div class="webcam-container">
      <video
        id="webcam-video"
        ref="video"
        :height="height"
        :src="source"
        :width="width"
        autoplay
        muted
        playsinline
      />
      </div>
      <div style="margin-left: 10px;">
        <el-switch v-model="active" />
        <span style="margin-left: 10px;">activate video</span>
      </div>
    </div>
  </card-wrapper>
</template>

<script>
import CardWrapper from "./CardWrapper.vue";

export default {
  name: 'Webcam',
  components: { CardWrapper },
  props: {
    width: {
      type: [Number, String],
      default: 400,
    },
    height: {
      type: [Number, String],
      default: 300,
    },
    screenshotFormat: {
      type: String,
      default: 'image/jpeg',
    },
    video: {
      type: Boolean,
      default: false,
    },
    resolution: {
      type: Object,
      default: null,
      validator(value) {
        return value.height && value.width;
      },
    },
  },
  data() {
    // this.$input.setup(this);
    return {
      type: 'image',
      source: null,
      canvas: null,
      camerasListEmitted: false,
      cameras: [],
      deviceId: null,
      active: false,
      instances: [],
      cid: null,
      recording: false,
      firstFrame: null,
    };
  },
  watch: {
    active(v) {
      if (v) {
        if (!this.camerasListEmitted) {
          this.loadCameras();
        } else {
          this.start();
        }
      } else {
        this.stop();
      }
    },
  },
  beforeDestroy() {
    this.stop();
  },
  mounted() {
    this.setupMedia();
  },
  methods: {
    capture() {
      return this.$refs.video;
    },
    startRecording() {
      this.instances = [];
      this.recording = true;
      this.firstFrame = this.record();
    },
    async record() {
      if (!this.recording) return;
      this.instances.push({
        type: 'image',
        features: await this.$input.preprocess(this.capture()),
        thumbnail: this.captureSnapshot(),
        rawData: new Blob([], { type: 'text/txt' }),
      });
      this.cid = window.requestAnimationFrame(this.record);
    },
    async stopRecording() {
      this.recording = false;
      await this.firstFrame;
      if (this.cid) {
        window.cancelAnimationFrame(this.cid);
      }
      return this.instances;
    },
    captureSnapshot() {
      return this.getCanvas().toDataURL(this.screenshotFormat);
    },
    legacyGetUserMediaSupport() {
      return constraints => {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia ||
          navigator.oGetUserMedia;
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    },
    setupMedia() {
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = this.legacyGetUserMediaSupport();
      }
      // this.testMediaAccess();
    },
    loadCameras() {
      navigator.mediaDevices
        .enumerateDevices()
        .then(deviceInfos => {
          for (let i = 0; i !== deviceInfos.length; i += 1) {
            const deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'videoinput') {
              this.cameras.push(deviceInfo);
            }
          }
        })
        .then(() => {
          if (!this.camerasListEmitted) {
            this.$emit('cameras', this.cameras);
            this.camerasListEmitted = true;
          }
          if (this.cameras.length === 1) {
            this.deviceId = this.cameras[0].deviceId;
            this.loadCamera(this.cameras[0].deviceId);
          }
        })
        .catch(error => this.$emit('notsupported', error));
    },
    /**
     * change to a different camera stream, like front and back camera on phones
     */
    changeCamera(deviceId) {
      this.stop();
      this.$emit('camera-change', deviceId);
      this.loadCamera(deviceId);
    },
    /**
     * load the stream to the
     */
    loadSrcStream(stream) {
      if ('srcObject' in this.$refs.video) {
        // new browsers api
        this.$refs.video.srcObject = stream;
      } else {
        // old broswers
        this.source = window.HTMLMediaElement.srcObject(stream);
      }
      // Emit video start/live event
      this.$refs.video.onloadedmetadata = () => {
        this.$emit('video-live', stream);
      };
      this.$emit('started', stream);
    },
    /**
     * stop the selected streamed video to change camera
     */
    stopStreamedVideo(videoElem) {
      const stream = videoElem.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        // stops the video track
        track.stop();
        this.$emit('stopped', stream);
        this.$refs.video.srcObject = null;
        this.source = null;
      });
    },
    // Stop the video
    stop() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.stopStreamedVideo(this.$refs.video);
      }
      this.$emit('active', false);
    },
    // Start the video
    start() {
      if (this.deviceId) {
        this.loadCamera(this.deviceId);
        this.$emit('active', true);
      }
    },
    pause() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.pause();
      }
    },
    resume() {
      if (this.$refs.video !== null && this.$refs.video.srcObject) {
        this.$refs.video.play();
      }
    },
    /**
     * test access
     */
    async testMediaAccess() {
      const constraints = { video: true };
      if (this.resolution) {
        constraints.video = {};
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // Make sure to stop this MediaStream
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        this.loadCameras();
      } catch (e) {
        this.$emit('error', e);
      }
    },
    /**
     * load the Camera passed as index!
     */
    loadCamera(device) {
      const constraints = { video: { deviceId: { exact: device } } };
      if (this.resolution) {
        constraints.video.height = this.resolution.height;
        constraints.video.width = this.resolution.width;
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => this.loadSrcStream(stream))
        .catch(error => this.$emit('error', error));
    },
    getCanvas() {
      const { video } = this.$refs;
      if (!this.ctx) {
        const canvas = document.createElement('canvas');
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
      }
      const { ctx, canvas } = this;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    },
  },
};
</script>

<style scoped>
.webcam {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.webcam .webcam-container {
  width: 300px;
  height: 300px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  margin: 10px;
  border: 1px solid grey;
}

video {
  transform: scaleX(-1);
}
</style>
