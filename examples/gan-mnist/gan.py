from __future__ import print_function, division
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import BatchNormalization
from tensorflow.keras.layers import LeakyReLU
from tensorflow.keras.layers import Input, Dense, Reshape, Flatten
from tensorflow.keras.datasets import mnist
import tensorflowjs as tfjs
import os


class GAN:
    def __init__(self):
        self.img_rows = 28
        self.img_cols = 28
        self.channels = 1
        self.img_shape = (self.img_rows, self.img_cols, self.channels)
        self.latent_dim = 100

        optimizer = Adam(0.0002, 0.5)

        # Build and compile the discriminator
        self.discriminator = self.build_discriminator()
        self.discriminator.compile(
            loss="binary_crossentropy",
            optimizer=optimizer,
            metrics=["accuracy"],
        )

        # Build the generator
        self.generator = self.build_generator()

        # The generator takes noise as input and generates imgs
        z = Input(shape=(self.latent_dim,))
        img = self.generator(z)

        # For the combined model we will only train the generator
        self.discriminator.trainable = False

        # The discriminator takes generated images as input and determines validity
        validity = self.discriminator(img)

        # The combined model  (stacked generator and discriminator)
        # Trains the generator to fool the discriminator
        self.combined = Model(z, validity)
        self.combined.compile(loss="binary_crossentropy", optimizer=optimizer)

    def build_generator(self):

        model = Sequential()

        model.add(Dense(256, input_dim=self.latent_dim))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(512))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(1024))
        model.add(LeakyReLU(alpha=0.2))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Dense(np.prod(self.img_shape), activation="tanh"))
        model.add(Reshape(self.img_shape))

        model.summary()

        noise = Input(shape=(self.latent_dim,))
        img = model(noise)

        return Model(noise, img)

    def build_discriminator(self):
        model = Sequential()
        model.add(Flatten(input_shape=self.img_shape))
        model.add(Dense(512))
        model.add(LeakyReLU(alpha=0.2))
        model.add(Dense(256))
        model.add(LeakyReLU(alpha=0.2))
        model.add(Dense(1, activation="sigmoid"))
        model.summary()

        img = Input(shape=self.img_shape)
        validity = model(img)

        return Model(img, validity)

    def train(
        self,
        epochs,
        batch_size=64,
        sample_images_interval=100,
        sample_models_interval=5000,
        sample_models_at=[0, 100, 250, 500, 1000, 2000],
    ):
        try:
            os.mkdir("images")
        except FileExistsError:
            pass
        try:
            os.mkdir("tfjs_models")
        except FileExistsError:
            pass
        yield {
            "status": "start",
            "epochs": epochs,
        }
        try:
            # Load the dataset
            (X_train, _), (_, _) = mnist.load_data()

            # Rescale -1 to 1
            X_train = X_train / 127.5 - 1.0
            X_train = np.expand_dims(X_train, axis=3)

            # Adversarial ground truths
            valid = np.ones((batch_size, 1))
            fake = np.zeros((batch_size, 1))

            for epoch in range(epochs):

                # ---------------------
                #  Train Discriminator
                # ---------------------

                # Select a random batch of images
                idx = np.random.randint(0, X_train.shape[0], batch_size)
                imgs = X_train[idx]

                noise = np.random.normal(0, 1, (batch_size, self.latent_dim))

                # Generate a batch of new images
                gen_imgs = self.generator.predict(noise)

                # Train the discriminator
                d_loss_real = self.discriminator.train_on_batch(imgs, valid)
                d_loss_fake = self.discriminator.train_on_batch(gen_imgs, fake)
                d_loss = 0.5 * np.add(d_loss_real, d_loss_fake)

                # ---------------------
                #  Train Generator
                # ---------------------

                noise = np.random.normal(0, 1, (batch_size, self.latent_dim))

                # Train the generator (to have the discriminator label samples as valid)
                g_loss = self.combined.train_on_batch(noise, valid)

                # Plot the progress
                print(
                    "%d [D loss: %f, acc.: %.2f%%] [G loss: %f]"
                    % (epoch, d_loss[0], 100 * d_loss[1], g_loss)
                )

                epochMessage = {
                    "status": "epoch",
                    "epoch": epoch,
                    "epochs": epochs,
                    "data": {
                        "discriminatorLoss": d_loss[0],
                        "discriminatorAcc": d_loss[1],
                        "generatorLoss": g_loss,
                    },
                }

                # If at save interval => save generated image samples
                # if epoch in [0, 100, 250, 500, 1000, 2000] or epoch % 5000 == 0:
                if epoch in sample_models_at or epoch % sample_models_interval == 0:
                    # self.generator.save('saved_model/generator_%i.h5' % epoch)
                    # self.discriminator.save('saved_model/discriminator_%i.h5' % epoch)
                    tfjs.converters.save_keras_model(
                        self.generator, "tfjs_models/generator_%i.h5" % epoch
                    )
                    tfjs.converters.save_keras_model(
                        self.discriminator,
                        "tfjs_models/discriminator_%i.h5" % epoch,
                    )
                    epochMessage["model"] = "tfjs_models/generator_%i.h5" % epoch
                if epoch % sample_images_interval == 0:
                    self.sample_images(epoch)
                    epochMessage["sample"] = "images/%i.png" % epoch
                yield epochMessage
            yield {
                "status": "success",
                "epoch": epoch,
                "epochs": epochs,
            }
        except Exception as e:
            yield {"status": "error", "data": e}

    def sample_images(self, epoch):
        r, c = 2, 8
        noise = np.random.normal(0, 1, (r * c, self.latent_dim))
        gen_imgs = self.generator.predict(noise)

        # Rescale images 0 - 1
        gen_imgs = 0.5 * gen_imgs + 0.5

        fig, axs = plt.subplots(r, c, figsize=(9, 2))
        plt.subplots_adjust(
            left=0.05, right=0.95, bottom=0.05, top=0.95, wspace=0.05, hspace=0.05
        )
        cnt = 0
        for i in range(r):
            for j in range(c):
                axs[i, j].imshow(gen_imgs[cnt, :, :, 0], cmap="gray")
                axs[i, j].axis("off")
                cnt += 1
        fig.savefig("images/%d.png" % epoch)
        plt.close()


# class GanTrainer(threading.Thread):
#     def __init__(self, queue, parameters):
#         threading.Thread.__init__(self)
#         self.terminated = False
#         self.queue = queue
#         self.parameters = parameters

#     def stop(self):
#         self.terminated = True

#     def run(self):
#         print("trainGAN", self.parameters)
#         gan = GAN()
#         for epochData in gan.train(**self.parameters):
#             self.queue.put(epochData)
#             if self.terminated:
#                 self.queue.put({"status": "idle"})
#                 print("Training has been interrupted")
#                 break


if __name__ == "__main__":
    gan = GAN()
    [
        i
        for i in gan.train(
            epochs=25000,
            batch_size=32,
            sample_images_interval=100,
            sample_models_interval=5000,
            sample_models_at=[0, 100, 250, 500, 1000, 2000],
        )
    ]
