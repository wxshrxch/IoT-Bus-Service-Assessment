import time
import random
import math

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

from utils import epoch_time, binary_accuracy
from models.vanilla_rnn import RNN
from models.bidirectional_lstm import BidirectionalLSTM
from models.cnn import CNN

random.seed(32)
torch.manual_seed(32)
torch.backends.cudnn.deterministic = True


class Trainer:
    def __init__(self, config, pad_idx, cnn_idx=None, train_iter=None, valid_iter=None, test_iter=None, cnn_iter=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.config = config
        self.pad_idx = pad_idx
        self.cnn_idx = cnn_idx

        # Train mode
        if self.config.mode == 'train':
            self.train_iter = train_iter
            self.valid_iter = valid_iter

        # Test mode
        else:
            self.test_iter = test_iter
            self.cnn_iter = cnn_iter

        model_type = {
            'vanilla_rnn': RNN(self.config, self.pad_idx),
            'bidirectional_lstm': BidirectionalLSTM(self.config, self.pad_idx),
            'cnn': CNN(self.config),
        }

        self.model = model_type[self.config.model]
        self.model.to(self.device)

        # SGD updates all parameters with the 'same' learning rate
        # Adam adapts learning rate for each parameter
        optim_type = {
            'SGD': optim.SGD(self.model.parameters(), lr=self.config.lr),
            'Adam': optim.Adam(self.model.parameters()),
        }

        self.optimizer = optim_type[self.config.optim]

        # BCEWithLogitsLoss carries out both the sigmoid and the binary cross entropy steps.
        self.criterion = nn.BCEWithLogitsLoss()
        self.criterion.to(self.device)

    def train(self):
        print(f'The model has {self.model.count_parameters():,} trainable parameters')

        best_valid_loss = float('inf')

        print(self.model)

        for epoch in range(self.config.num_epoch):
            self.model.train()

            epoch_loss = 0
            epoch_acc = 0

            start_time = time.time()

            for batch in self.train_iter:
                # For each batch, first zero the gradients
                self.optimizer.zero_grad()

                # if Field has include_lengths=False, batch.text is only padded numericalized tensor
                # if Field has include_lengths=True, batch.text is tuple(padded numericalized tensor, sentence length)
                input, input_lengths = batch.text
                predictions = self.model(input, input_lengths).squeeze(1)
                # predictions = [batch size, 1]. after squeeze(1) = [batch size])

                loss = self.criterion(predictions, batch.label)
                acc = binary_accuracy(predictions, batch.label)

                loss.backward()
                self.optimizer.step()

                # 'item' method is used to extract a scalar from a tensor which only contains a single value.
                epoch_loss += loss.item()
                epoch_acc += acc.item()

            train_loss = epoch_loss / len(self.train_iter)
            train_acc = epoch_acc / len(self.train_iter)

            valid_loss, valid_acc = self.evaluate()

            end_time = time.time()

            epoch_mins, epoch_secs = epoch_time(start_time, end_time)

            if valid_loss < best_valid_loss:
                best_valid_loss = valid_loss
                torch.save(self.model.state_dict(), self.config.save_model)

            print(f'Epoch: {epoch + 1:02} | Epoch Time: {epoch_mins}m {epoch_secs}s')
            print(f'\tTrain Loss: {train_loss:.3f} | Train Acc: {train_acc * 100:.2f}%')
            print(f'\tVal. Loss: {valid_loss:.3f} | Val. Acc: {valid_acc * 100:.2f}%')

    def evaluate(self):
        epoch_loss = 0
        epoch_acc = 0

        self.model.eval()

        with torch.no_grad():
            for batch in self.valid_iter:
                input, input_lengths = batch.text
                predictions = self.model(input, input_lengths).squeeze(1)

                loss = self.criterion(predictions, batch.label)
                acc = binary_accuracy(predictions, batch.label)

                epoch_loss += loss.item()
                epoch_acc += acc.item()

        return epoch_loss / len(self.valid_iter), epoch_acc / len(self.valid_iter)

    def inference(self):
        epoch_loss = 0
        epoch_acc = 0

        self.model.load_state_dict(torch.load(self.config.save_model))
        self.model.eval()

        with torch.no_grad():
            for batch in self.test_iter:
                input, input_lengths = batch.text
                predictions = self.model(input, input_lengths).squeeze(1)

                loss = self.criterion(predictions, batch.label)
                acc = binary_accuracy(predictions, batch.label)

                epoch_loss += loss.item()
                epoch_acc += acc.item()

        test_loss = epoch_loss / len(self.test_iter)
        test_acc = epoch_acc / len(self.test_iter)
        print(f'Test Loss: {test_loss:.3f} | Test Acc: {test_acc * 100:.2f}%')

    def ensemble_inference(self):
        print("ensemble!")
        epoch_loss = 0
        epoch_acc = 0
        # weights = list(np.arange(0.1, 1, 0.1, dtype=float))
        weights = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
        print(weights)
        cnn = CNN(self.config)
        rnn = RNN(self.config, self.pad_idx)
        lstm = BidirectionalLSTM(self.config, self.pad_idx)

        cnn.to(self.device)
        rnn.to(self.device)
        lstm.to(self.device)

        cnn.load_state_dict(torch.load("cnn_model.pt"))
        print("Load CNN Model . . . .")
        rnn.load_state_dict(torch.load("rnn_model.pt"))
        print("Load Vanilla_Rnn Model . . . .")
        lstm.load_state_dict(torch.load("lstm_model.pt"))
        print("Load Bidirectional_LSTM Model . . . .")

        cnn.eval()
        rnn.eval()
        lstm.eval()
        tmp = []
        with torch.no_grad():
            for wc in weights:
                for wr in weights:
                    for wl in weights:
                        if wc + wr + wl == 1.0:

                            for batch, cnn_batch in zip(self.test_iter, self.cnn_iter):
                                input, input_lengths = batch.text
                                cnn_input, cnn_input_lengths = cnn_batch.text

                                predictions_cnn = cnn(cnn_input, cnn_input_lengths).squeeze(1)
                                predictions_rnn = rnn(input, input_lengths).squeeze(1)
                                predictions_lstm = lstm(input, input_lengths).squeeze(1)

                                predictions_ensemble = predictions_cnn * wc \
                                                       + predictions_rnn * wr \
                                                       + predictions_lstm * wl
                                loss_ensemble = 0
                                acc_ensemble = 0
                                loss_ensemble = self.criterion(predictions_ensemble, batch.label)
                                acc_ensemble = binary_accuracy(predictions_ensemble, batch.label)

                                epoch_loss += loss_ensemble.item()
                                epoch_acc += acc_ensemble.item()

                            test_loss = 0
                            test_acc = 0
                            test_loss = epoch_loss / len(self.test_iter)
                            test_acc = epoch_acc / len(self.test_iter)
                            epoch_loss = 0
                            epoch_acc = 0
                            print(wc, wr, wl, round(test_acc * 100, 2))

                            # print(f'Test Loss: {test_loss:.3f} | Test Acc: {test_acc * 100:.2f}%')
