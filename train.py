import os
import datetime
import argparse
import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import Input
from tensorflow.keras import backend as K
from preprocessing.augment_dataset import get_data, get_test
from tensorflow.keras.callbacks import ReduceLROnPlateau
from preprocessing.preprocess_utils import make_folder
from model import u_net
os.environ["CUDA_VISIBLE_DEVICES"]="0"

class Train:
    """ Loads dataset and trains the model
    :param num_classes: number of output classes.
    :type num_classes: int
    :param learning_rate: decay factor used during gradient descent.
    :type learning_rate: float
    :param epochs: number of times the dataset is traversed completely.
    :type epochs: int
    :param image_shape: shape of the input image.
    :type image_shape: array

    """

    def __init__(self):
        """ Constructor method.

        """
        self.num_classes = 19
        self.learning_rate = 0.001
        self.epochs = 50
        self.image_shape = (256, 256, 3)
        
    def compute_iou(self, y_true, y_pred):
        """ Computes mIoU for a given dataset.

        :param y_true: true mask
        :type: tensor (array)
        :param y_pred: predicted mask
        :type y_pred: tensor (array)
        ...
        :return: mIoU of the given dataset
        :rtype: float

        """
        y_pred = tf.math.argmax(y_pred, axis=-1)
        y_pred = tf.keras.backend.flatten(y_pred)
        y_true = tf.keras.backend.flatten(y_true)
        current = tf.math.confusion_matrix(y_true, y_pred)
        # compute mean iou
        # Returns the batched diagonal part of a batched tensor.
        intersection = tf.linalg.diag_part(current)
        ground_truth_set = tf.keras.backend.sum(current, axis=1)
        predicted_set = tf.keras.backend.sum(current, axis=0)
        union = ground_truth_set + predicted_set - intersection
        IoU = intersection / union
        #cast into float32
        return tf.dtypes.cast(tf.keras.backend.mean(IoU), tf.float32)

    def mIoU(self, y_true, y_pred):
        """ Calling python function 'compute_iou'.

        :param y_true: true mask
        :type: tensor (array)
        :param y_pred: predicted mask
        :type y_pred: tensor (array)
        ...
        :return: mIoU of the given dataset
        :rtype: float

        """
        return tf.py_function(self.compute_iou, [y_true, y_pred], tf.float32)

    def train(self):
        """ Train the model and check its metrics

        :param model_name: train the keras model using the given datasets
        :type model_name: tensors

        """
        input_img = Input(shape=self.image_shape, name='img')
        # unet https://www.jeremyjordan.me/semantic-segmentation/#loss
        model = u_net.get_u_net(input_img, num_classes=self.num_classes)
        optimizer = Adam(learning_rate=self.learning_rate)
        loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=False)
        model.compile(optimizer=optimizer,
                      loss=loss,
                      metrics=['accuracy', self.mIoU])
        train_data, valid_data = get_data()
        test_data = get_test()
        #Reduce learning rate when a metric has stopped improving.
        reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2,
                                      patience=5, min_lr=0.00000001)
        make_folder(os.path.join(os.path.dirname(__file__),
                                 'logs/fit'))
        log_dir = os.path.join(os.path.dirname(__file__),
                               'logs/fit/',
                               datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
        t_board = tf.keras.callbacks.TensorBoard(log_dir=log_dir,
                                                 histogram_freq=0)

        model.fit(train_data, epochs=self.epochs,
                  validation_data=valid_data,
                  callbacks=[reduce_lr, t_board])
        scores = model.evaluate(test_data, verbose=0)

        print("========================")
        print('[EVALUATION ON TEST SET]')
        print('{}: {:0.4f}'.format(model.metrics_names[0], scores[0]))
        print('%s: %.2f%%' % (model.metrics_names[1], scores[1] * 100))
        print('%s: %.2f%%' % (model.metrics_names[2], scores[2] * 100))
        print("========================")

        MODEL_DIR = os.path.join(os.path.dirname(__file__), 'results/models/')
        make_folder(MODEL_DIR)
        file_name = datetime.datetime.now().strftime("%m%d_%H%M") + "-" + "u_net"
        model.save(os.path.join(MODEL_DIR,
                                '{}.h5'.format(file_name)),
                   model)


def main():
    trainer = Train()
    trainer.train()


if __name__ == '__main__':
    main()
