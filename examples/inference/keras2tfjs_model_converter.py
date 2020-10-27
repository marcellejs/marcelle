import tensorflowjs as tfjs
import tensorflow as tf
import subprocess
import ssl 
ssl._create_default_https_context = ssl._create_unverified_context

# load model from keras applications
# see other models here: https://keras.io/api/applications 
model = tf.keras.applications.ResNet50(include_top=True, 
    weights="imagenet", 
    input_tensor=None, 
    input_shape=None, 
    pooling=None,
    classes=1000)

# create dir where to save the converted model
dirname = 'tfjsmodel' 
subprocess.call(['mkdir', '-p', dirname])

# convert model
# note that weight_shard_size_bytes should be set to a value higher than the size of the h5 file 
# to create a unique .bin file, otherwise several .bin files will be created with size = weight_shard_size_bytes 
# but they won't be accepted by the js interface 
tfjs.converters.save_keras_model(model, 'tfjsmodel', weight_shard_size_bytes=1000000000)
