// replace these values with those generated in your TokBox Account
let apiKey;
let sessionId;
let token;
let isPublisher = false;
let isSubscriber = false;
let url = '';

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    console.log(error.message);
  }
}

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  if (isSubscriber === true) {
    session.on('streamCreated', (event) => {
      session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%',
      }, handleError);
    });
  }

  if (isPublisher === true) {
    // Create a publisher
    let publisher = OT.initPublisher('publisher', {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    }, handleError);
  }

  // Connect to the session
  session.connect(token, (error) => {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else if (isPublisher === true) {
      session.publish(publisher, handleError);
    }
  });
}

function setDetails(details) {
  apiKey = details.apiKey;
  sessionId = details.sessionId;
  token = details.token;

  initializeSession();
}

async function getDetails(publisher, subscriber, url) {
  const request = await fetch(url);
  const response = await request.json();

  if (publisher === true) {
    isPublisher = true;
  }

  if (subscriber === true) {
    isSubscriber = true;
  }

  setDetails(response);
}

function fetchUrl() {
  return fetch('/config/config.txt')
   .then( r => r.text() )
   .then( t => { url = t} );
}
