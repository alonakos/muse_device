from oscpy.server import OSCThreadServer
from time import sleep
import json
from flask import Flask, jsonify
from flask_cors import CORS
import signal
import sys
import threading

eeg_values = []
offset = 0

app = Flask(__name__)
CORS(app)
@app.route('/')
def index():
    # print("Got request")
    global offset
    global eeg_values
    # print(eeg_values)
    values = eeg_values[offset:]
    offset = len(eeg_values)
    return jsonify(values)

# # def web_thread():
#     # app.run()

def eeg_callback(*values):
    eeg_values.append(values)
    # print("DATA")
    # print("got values: {}".format(len(eeg_values)))

x = threading.Thread(target=app.run)
x.start()

osc = OSCThreadServer()  # See sources for all the arguments
sock = osc.listen(address='192.168.1.20', port=5000, default=True)
osc.bind(b'/muse/eeg', eeg_callback)

def signal_handler(sig, frame):
    print('Stopping...')
    osc.stop()  # Stop the default socket
    osc.stop_all()  # Stop all sockets
    # Here the server is still alive, one might call osc.listen() again
    osc.terminate_server()  # Request the handler thread to stop looping
    osc.join_server()  # Wait for the handler thread to finish pending tasks and exit
    # sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.pause()

# sleep(1000)


