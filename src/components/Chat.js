import React, { Component } from 'react';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import '../chat.css';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [], // {content: 'some message', self: true}
      typedMessage: '',
      hideChat: false,
    };
    this.socket = io.connect('http://codeial.codingninjas.com:5000');
    this.userEmail = props.user.email;
  }
  componentDidMount() {
    if (this.userEmail) {
      this.setupConnections();
    }
  }
  setupConnections = () => {
    const socketConnection = this.socket;
    const self = this;

    this.socket.on('connect', function () {
      console.log('CONNECTION ESTABLISHED');

      socketConnection.emit('join_room', {
        user_email: this.userEmail,
        chatroom: 'codeial',
      });

      socketConnection.on('user_joined', function (data) {
        console.log('NEW USER JOINED', data);
      });
    });

    this.socket.on('receive_message', function (data) {
      // add message to state
      const { messages } = self.state;
      const messageObject = {};
      messageObject.content = data.message;
      messageObject.id = messages.length + 1;

      if (data.user_email === self.userEmail) {
        messageObject.self = true;
      }

      self.setState({
        messages: [...messages, messageObject],
        typedMessage: '',
      });
    });
  };

  handleSubmit = () => {
    const { typedMessage } = this.state;

    if (typedMessage && this.userEmail) {
      this.socket.emit('send_message', {
        message: typedMessage,
        user_email: this.userEmail,
        chatroom: 'codeial',
      });
    }
  };
  handleHide = () => {
    const val = !this.state.hideChat;
    this.setState((prevState) => {
      return {
        ...prevState,
        hideChat: val,
      };
    });
  };
  render() {
    const { typedMessage, messages, hideChat } = this.state;
    return (
      <div className={hideChat ? 'chat-container chat-down' : 'chat-container'}>
        <div className="chat-header">
          Chat
          <img
            src="https://image.flaticon.com/icons/png/512/992/992683.png"
            alt=""
            height={17}
            onClick={this.handleHide}
          />
        </div>
        {!hideChat && (
          <div>
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  className={
                    message.self
                      ? 'chat-bubble self-chat'
                      : 'chat-bubble other-chat'
                  }
                  key={message.id}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="chat-footer">
              <input
                type="text"
                value={typedMessage}
                placeholder="start typing here..."
                onChange={(e) =>
                  this.setState({ typedMessage: e.target.value })
                }
              />
              <button onClick={this.handleSubmit}>Send</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return {
    user: auth.user,
  };
}
export default connect(mapStateToProps)(Chat);
