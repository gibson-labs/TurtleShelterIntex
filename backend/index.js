// Chloe Cloud, John Gibson, Aaron Shaw, Andrew Malone
// Description: This is a node express app that serves as the backend for the Turtle Shelter project website 
let express = require('express');

let app = express(); // app is now an object of express type. App is variable of the whole website

let path = require('path'); // access to the path 

const port = process.env.PORT || 5002
const host = process.env.HOST || '0.0.0.0'

// Helper: determine a likely LAN IP to share for testing
const os = require('os');
function getLocalLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        const ip = net.address;
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') || ip.startsWith('172.19.') || ip.startsWith('172.2') || ip.startsWith('172.3')) {
          return ip;
        }
      }
    }
  }
  return 'localhost';
}

const session = require('express-session'); 

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Showcase mode: bypass auth and database, serve mock data so the app can run anywhere
const SHOWCASE = true;

app.use(express.urlencoded( {extended: true} )) //determines how html is received from forms. This allows us to grab stuff out of the HTML form

app.set("view engine", "ejs") //shows what view engine we are using 

app.set("views", path.join(__dirname, "../frontend/views")) //This is telling the server that we are going to start using certain views

app.use(express.urlencoded({extended: true})); //allows us to get data out of the request.body
app.use(express.json());

// Expose current path to EJS views for active nav highlighting
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Session middleware setup
app.use(session({
  secret: '123456789', // Replace with a secure secret key
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // Session expires after 60 minutes
}));


// Serve static files from the 'CSS' directory
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));

// Serve static files from the 'backend' folder (for JavaScript)
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// Serve static files from the frontend folder
app.use(express.static('frontend'));

const knex = require("knex") ({
  client : "pg",
  connection : {
      host : process.env.RDS_HOSTNAME || "awseb-e-xg3qx7rimi-stack-awsebrdsdatabase-d32v4dftp3db.cna8yiecw5c6.us-east-1.rds.amazonaws.com",
      user : process.env.RDS_USERNAME || "turtle",
      password : process.env.RDS_PASSWORD || "splishsplash",
      database : process.env.RDS_DB_NAME || "ebdb",
      port : process.env.RDS_PORT || 5432,
      ssl: {rejectUnauthorized: false}
  }
});


// Mock data for showcase mode
const sampleEvents = [
  {
    eventid: 1,
    eventstatus: 'planned',
    eventdate: new Date('2025-02-15'),
    starttime: '10:00 AM',
    city: 'Salt Lake City',
    state: 'UT',
    zip: '84101',
    contactname: 'John Doe',
    contactphone: '555-123-4567',
    contactemail: 'john@example.com',
    eventactivities: 'Vest sewing',
    organization: 'Community Org'
  },
  {
    eventid: 2,
    eventstatus: 'approved',
    startdaterange: new Date('2025-03-01'),
    starttime: '09:00 AM',
    city: 'Provo',
    state: 'UT',
    zip: '84601',
    contactname: 'Jane Smith',
    contactphone: '555-987-6543',
    contactemail: 'jane@example.com',
    eventactivities: 'Outreach',
    organization: 'Helping Hands'
  },
  {
    eventid: 3,
    eventstatus: 'completed',
    eventdate: new Date('2024-12-01'),
    starttime: '01:00 PM',
    city: 'Ogden',
    state: 'UT',
    zip: '84401',
    contactname: 'Mike Johnson',
    contactphone: '555-222-3333',
    contactemail: 'mike@example.com',
    eventactivities: 'Training',
    organization: 'Local Church'
  }
];

const sampleVolunteers = [
  {
    volunteerid: 1,
    firstname: 'alex',
    lastname: 'carter',
    phone: '555-000-1111',
    email: 'alex@example.com',
    city: 'salt lake city',
    state: 'ut',
    howtheyheard: 'friend',
    sewinglevel: 'intermediate',
    monthlyhrswilling: 5,
    leadevent: true,
    traveltime: 30,
    comments: 'excited to help'
  },
  {
    volunteerid: 2,
    firstname: 'sam',
    lastname: 'taylor',
    phone: '555-222-1111',
    email: 'sam@example.com',
    city: 'provo',
    state: 'ut',
    howtheyheard: 'instagram',
    sewinglevel: 'beginner',
    monthlyhrswilling: 2,
    leadevent: false,
    traveltime: 15,
    comments: ''
  }
];

const sampleAdmins = [
  {
    volunteerid: 1,
    firstname: 'alex',
    lastname: 'carter',
    phone: '555-000-1111',
    email: 'alex@example.com',
    city: 'salt lake city',
    state: 'ut',
    username: 'admin',
    password: 'password',
    role: 'admin'
  },
  {
    volunteerid: 2,
    firstname: 'sam',
    lastname: 'taylor',
    phone: '555-222-1111',
    email: 'sam@example.com',
    city: 'provo',
    state: 'ut',
    username: 'volunteer',
    password: 'password',
    role: 'volunteer'
  }
];




// Routes and other middleware
app.get('/', (req, res) => {
  res.render('index');  // Or your view rendering logic
});

//Route to got to the event request page
app.get('/eventRequest', (req, res) => {
  res.render('eventRequest'); 

});

//Route to How to help page
app.get('/howToHelp', (req, res) => {
  res.render('howToHelp'); 
}); 

//Route to get howToHelpIcons
app.get('/howToHelpIcons', (req, res) => {
  res.redirect('/howToHelp#help');
});



//Route to the donate page
app.get('/donate', (req, res) => {
  res.redirect('https://turtleshelterproject.org/checkout/donate?donatePageId=5b6a44c588251b72932df5a0'); 

});

// Route to volunteer page
app.get('/volunteerPage', isAuthenticated, isVolunteer, (req, res) => {
  if (SHOWCASE) {
    const events = sampleEvents
      .filter(e => e.eventstatus === 'approved' || e.eventstatus === 'planned')
      .sort((a, b) => new Date(a.eventdate || a.startdaterange || 0) - new Date(b.eventdate || b.startdaterange || 0));
    return res.render('volunteerPage', { events });
  }
  const volunteerId = req.session.volunteerid; // Retrieve volunteerid from the session

  if (!volunteerId) {
    return res.status(403).send('Forbidden');
  }

  // Query events the volunteer has NOT signed up for
  knex('event')
    .whereIn('eventstatus', ['approved', 'planned']) // Only approved or planned events
    .whereNotIn('eventid', function () {
      // Subquery to get event IDs the volunteer has signed up for
      this.select('eventid')
        .from('volunteer_events')
        .where('volunteerid', volunteerId);
    })
    .orderBy('eventdate', 'asc')
    .orderBy('startdaterange', 'asc')
    .then(events => {
      res.render('volunteerPage', { events }); // Pass events to the view
    })
    .catch(error => {
      console.error('Error fetching events for volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Route to add volunteer to an event
app.post('/eventSignup', isAuthenticated, isVolunteer, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/volunteerPage');
  }
  const { eventid } = req.body;
  const volunteerid = req.session.volunteerid; // Get the volunteerid from the session

  if (!eventid || !volunteerid) {
    return res.status(400).json({ message: 'Event ID and Volunteer ID are required.' });
  }

  knex('volunteer_events')
    .insert({ eventid, volunteerid })
    .then(() => {
      res.redirect('/volunteerPage'); // Redirect to volunteerPage for volunteers
    })
    .catch(error => {
      console.error('Error adding volunteer to event:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});


// To load the events that the volunteer is signed up for
// Route to show events the volunteer is signed up for
app.get('/volunteerMain', isAuthenticated, isVolunteer, (req, res) => {
  if (SHOWCASE) {
    const events = sampleEvents
      .filter(e => e.eventstatus === 'planned')
      .sort((a, b) => new Date(a.eventdate || a.startdaterange || 0) - new Date(b.eventdate || b.startdaterange || 0));
    return res.render('volunteerMain', { events });
  }
  const volunteerId = req.session.volunteerid; // Retrieve volunteer ID from the session

  if (!volunteerId) {
    return res.status(403).send('Forbidden');
  }

  // Query events the volunteer is signed up for
  knex('event')
    .join('volunteer_events', 'event.eventid', 'volunteer_events.eventid') // Join event table with volunteer_events table
    .select('event.*') // Select all event details
    .where('volunteer_events.volunteerid', volunteerId) // Filter for events signed up by this volunteer
    .orderBy('eventdate', 'asc')
    .orderBy('startdaterange', 'asc')
    .then(events => {
      res.render('volunteerMain', { events }); // Render the 'myEvents' view and pass the events
    })
    .catch(error => {
      console.error('Error fetching signed-up events:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Remove the volunteer from the event
app.post('/removeSignup', isAuthenticated, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/volunteerMain');
  }
  const { eventid } = req.body; // Extract eventid from the request body
  const volunteerid = req.session.volunteerid; // Get volunteerid from the session

  if (!eventid || !volunteerid) {
    return res.status(400).send('Missing event or volunteer ID.');
  }

  knex('volunteer_events')
    .where({ eventid, volunteerid })
    .del()
    .then(() => {
      res.redirect('/volunteerMain'); // Redirect to volunteerMain for volunteers
    })
    .catch(error => {
      console.error('Error removing volunteer from event:', error);
      res.status(500).send('Internal Server Error');
    });
});

//Route to volunteer form page
app.get('/volunteerForm', (req, res) => {
  res.render('volunteerForm'); 

});

//Route to admin form page
app.get('/addAdmin', isAuthenticated, (req, res) => {
  res.render('adminForm'); 

});  

app.get('/login', (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/internalLanding');
  }
  if (req.session && req.session.isAuthenticated) {
    if (req.session.userRole === 'admin') {
      return res.redirect('/internalLanding');
    } else if (req.session.userRole === 'volunteer') {
      return res.redirect('/volunteerMain');
    }
  }
  res.render('login');
});
 

app.post('/login', (req, res) => {
  if (SHOWCASE) {
    req.session.isAuthenticated = true;
    req.session.userRole = 'admin';
    return res.redirect('/internalLanding');
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('login', { error: 'Username and password are required.' });
  }
  knex('admin')
    .select('*')
    .where({ username, password })
    .first()
    .then(user => {
      if (user) {
        req.session.isAuthenticated = true;
        req.session.userRole = user.role;
        req.session.volunteerid = user.volunteerid;
        req.session.save(err => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).send('Internal Server Error');
          }
          if (user.role === 'admin') {
            res.redirect('/internalLanding');
          } else if (user.role === 'volunteer') {
            res.redirect('/volunteerMain');
          }
        });
      } else {
        res.render('login', { error: 'Invalid username or password.' });
      }
    })
    .catch(err => {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
    });
});


// Authentication middleware
function isAuthenticated(req, res, next) {
  if (SHOWCASE) {
    return next();
  }
  if (req.session && req.session.isAuthenticated) {
    // User is authenticated, proceed to the next middleware
    return next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect('/login');
  }
}

// Authorization middleware for admin users
function isAdmin(req, res, next) {
  if (SHOWCASE) {
    return next();
  }
  if (req.session && req.session.userRole === 'admin') {
    return next();
  } else {
    res.status(403).send('Access denied. Admins only.');
  }
}

// Authorization middleware for regular users
function isVolunteer(req, res, next) {
  if (SHOWCASE) {
    return next();
  }
  if (req.session && (req.session.userRole === 'volunteer' || req.session.userRole === 'admin')) {
    return next();
  } else {
    res.status(403).send('Access denied.');
  }
}

// Logout endpoint
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Failed to log out. Please try again.');
    }
    // Redirect to home page or login page after logout
    res.redirect('/login'); // Or replace with '/' if you want to redirect to the homepage
  });
});

// Protected routes using the authentication middleware
app.get('/internalLanding', isAuthenticated, isVolunteer, (req, res) => {
  if (SHOWCASE) {
    const statusCounts = sampleEvents.reduce((acc, ev) => {
      acc[ev.eventstatus] = (acc[ev.eventstatus] || 0) + 1;
      return acc;
    }, {});
    const planned = sampleEvents.filter(e => e.eventstatus === 'planned');
    return res.render('internalLanding', { events: planned, statusCounts });
  }
  const eventStatusCounts = knex('event')
    .select('eventstatus')
    .count('eventid as count')
    .groupBy('eventstatus');
  const plannedEvents = knex('event')
    .select(
      'eventstatus',
      'eventdate',
      'eventactivities',
      'city',
      'state',
      'zip',
      'starttime',
      'contactname',
      'organization',
      'startdaterange',
      'contactname',
      'contactphone',
      'contactemail'
    )
    .where('eventstatus', 'planned')
    .orderBy('eventdate', 'asc')
    .orderBy('startdaterange', 'asc');
  Promise.all([eventStatusCounts, plannedEvents])
    .then(([counts, events]) => {
      const statusCounts = counts.reduce((acc, row) => {
        acc[row.eventstatus] = row.count;
        return acc;
      }, {});
      res.render('internalLanding', { events, statusCounts });
    })
    .catch(error => {
      console.error('Error fetching data for internalLanding:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/adminRedirect', (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/internalLanding');
  }
  if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
    res.redirect('/internalLanding');
  } else if (req.session && req.session.isAuthenticated && req.session.isVolunteer) {
    res.redirect('/volunteerPage');
  } else {
    res.redirect('/login');
  }
}); 

// To post the new admin to the database
app.post('/submitAdminForm', isAuthenticated, isAdmin, (req, res) => {
  // Access each value directly from req.body
  const firstname = req.body.FirstName.toLowerCase();
  const lastname = req.body.LastName.toLowerCase();
  const phone = req.body.Phone;
  const email = req.body.Email.toLowerCase();
  const city = req.body.City.toLowerCase();
  const state = req.body.state;
  const howtheyheard = req.body.HowTheyHeard.toLowerCase();
  const sewinglevel = req.body.SewingLevel;
  const monthlyhrswilling = parseInt(req.body.MonthlyHrsWilling); // Convert to integer
  const leadwilling = req.body.LeadWilling;
  const traveltime = parseInt(req.body.TravelTime); // Convert to integer
  const comments = req.body.Comments || 'No comments';
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  // Use a transaction to ensure both inserts happen together
  knex.transaction(trx => {
    return trx('volunteer')
      .insert({
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        email: email,
        city: city,
        state: state,
        howtheyheard: howtheyheard,
        sewinglevel: sewinglevel,
        monthlyhrswilling: monthlyhrswilling,
        leadwilling: leadwilling,
        traveltime: traveltime,
        comments: comments,
      })
      .returning('volunteerid') // Return the ID of the inserted volunteer
      .then(volunteerIds => {
        const volunteerId = Array.isArray(volunteerIds) && typeof volunteerIds[0] === 'object'
          ? volunteerIds[0].volunteerid // Extract ID if knex returns an object
          : volunteerIds[0]; // Extract ID if knex returns a plain array

        // Insert the admin record with the foreign key reference to the volunteer
        return trx('admin').insert({
          volunteerid: volunteerId,
          username: username,
          password: password,
          role : role,
        });
      });
  })
    .then(() => {
      res.redirect('/adminRecords'); // Redirect after successful insertion
    })
    .catch(error => {
      console.error('Error adding Admin:', error);
      res.status(500).send('Internal Server Error');
    });
});

 //Route to display events with optional status filter
app.get('/eventRecords', isAdmin, (req, res) => {
  const status = (req.query.status || 'all').toLowerCase();
  if (SHOWCASE) {
    const validStatuses = ['pending', 'approved', 'planned', 'completed'];
    let events = sampleEvents
      .slice()
      .sort((a, b) => new Date(a.eventdate || a.startdaterange || 0) - new Date(b.eventdate || b.startdaterange || 0));
    if (status !== 'all' && validStatuses.includes(status)) {
      events = events.filter(e => e.eventstatus === status);
    }
    return res.render('eventRecords', { events, eventstatus: status });
  }
  const validStatuses = ['pending', 'approved', 'planned', 'completed'];
  let query = knex('event').select('*').orderBy('eventdate', 'asc').orderBy('startdaterange', 'asc');
  if (status && status !== 'all' && validStatuses.includes(status)) {
    query = query.where('eventstatus', status);
  }
  query
    .then(events => {
      res.render('eventRecords', { events, eventstatus: status });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Deletes a admin record
app.post('/deleteAdmin/:volunteerid', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/adminRecords');
  }
  const volunteerid = parseInt(req.params.volunteerid, 10); // Extract volunteer ID

  knex('admin')
    .where('volunteerid', volunteerid)
    .del()
    .then(() => {
      return knex('admin').where('volunteerid', volunteerid).del();
    })
    .then(() => {
      res.redirect('/adminRecords'); // Redirect after successful deletion
    })
    .catch(error => {
      console.error('Error deleting Admin Record:', error);
      res.status(500).send('Internal Server Error');
    });
});
   

// Deletes an Event and any associated volunteer_event records
app.post('/deleteEventRec/:eventid', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/eventRecords');
  }
  const eventid = parseInt(req.params.eventid, 10); // Extract event ID

  // Step 1: Delete associated records in volunteer_event
  knex('volunteer_events')
    .where('eventid', eventid)
    .del()
    .then(() => {
      // Step 2: Delete the event record
      return knex('event').where('eventid', eventid).del();
    })
    .then(() => {
      res.redirect('/eventRecords'); // Redirect after successful deletion
    })
    .catch(error => {
      console.error('Error deleting Event Record:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.get('/volunteerRecords', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.render('volunteerRecords', { volunteer: sampleVolunteers });
  }
  knex('volunteer')
    .select(
      'volunteerid',
      'firstname',
      'lastname',
      'email',
      'phone',
      'city',
      'state',
      'howtheyheard',
      'sewinglevel',
      'monthlyhrswilling',
      'leadwilling',
      'traveltime',
      'comments'
    )
    .orderBy('lastname', 'asc')
    .orderBy('firstname', 'asc')
    .then(volunteer => {
      res.render('volunteerRecords', { volunteer });
    })
    .catch(error => {
      console.error('Error querying database:', error);
      res.status(500).send('Internal Server Error');
    });
});

//Make save functionality for the volunteer records
app.post('/saveVolunteer/:volunteerid', isAuthenticated, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/volunteerRecords');
  }
  const volunteerid = parseInt(req.params.volunteerid, 10);
  const {
    FirstName,
    LastName,
    Phone,
    Email,
    City,
    state,
    HowTheyHeard,
    SewingLevel,
    MonthlyHrsWilling,
    LeadWilling,
    TravelTime,
    Comments
  } = req.body;

  knex('volunteer')
    .where('volunteerid', volunteerid)
    .update({
      firstname: FirstName.toLowerCase(),
      lastname: LastName.toLowerCase(),
      phone: Phone,
      email: Email.toLowerCase(),
      city: City.toLowerCase(),
      state: state,
      howtheyheard: HowTheyHeard.toLowerCase(),
      sewinglevel: SewingLevel.toLowerCase(),
      monthlyhrswilling: parseInt(MonthlyHrsWilling),
      leadwilling: LeadWilling.toLowerCase(),
      traveltime: parseInt(TravelTime),
      comments: Comments || 'No comments'
    })
    .then(() => {
      res.redirect('/volunteerRecords');
    })
    .catch(error => {
      console.error('Error updating volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

//Make save functionality for the admin records
app.post('/saveAdmin/:volunteerid', isAuthenticated, async (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/adminRecords');
  }
  const volunteerid = parseInt(req.params.volunteerid, 10);
  const {
    FirstName,
    LastName,
    Phone,
    Email,
    City,
    state,
    username,
    password,
    role,
  } = req.body;

  try {
    // Update admin table
    await knex('admin')
      .where('volunteerid', volunteerid)
      .update({
        username: username,
        password: password,
        role: role.toLowerCase(),
      });

    // Update volunteer table
    await knex('volunteer')
      .where('volunteerid', volunteerid)
      .update({
        firstname: FirstName.toLowerCase(),
        lastname: LastName.toLowerCase(),
        phone: Phone,
        email: Email.toLowerCase(),
        city: City.toLowerCase(),
        state: state,
      });

    // Redirect after both updates are successful
    res.redirect('/adminRecords');
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Deletes a volunteer and any associated admin and volunteer_event records
app.post('/deleteVolunteer/:volunteerid', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/volunteerRecords');
  }
  const volunteerid = parseInt(req.params.volunteerid, 10); // Extract volunteer ID

  // Step 1: Delete associated records in volunteer_event
  knex('volunteer_events')
    .where('volunteerid', volunteerid)
    .del()
    .then(() => {
      // Step 2: Delete associated admin record
      return knex('admin').where('volunteerid', volunteerid).del();
    })
    .then(() => {
      // Step 3: Delete the volunteer record
      return knex('volunteer').where('volunteerid', volunteerid).del();
    })
    .then(() => {
      res.redirect('/volunteerRecords'); // Redirect after successful deletion
    })
    .catch(error => {
      console.error('Error deleting Volunteer Record:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.get('/editEventRec/:eventid', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    const eventid = parseInt(req.params.eventid, 10);
    const event = sampleEvents.find(e => e.eventid === eventid);
    if (!event) {
      return res.status(404).send('Event not found');
    }
    return res.render('editEventRec', { event });
  }
  const eventid = req.params.eventid;

   //Query the Event by eventid
  knex('event')
    .where('eventid', eventid)
    .first()
    .then(event => {
      if (!event) {
        return res.status(404).send('Event not found');
      }
      res.render('editEventRec', { event }); // Pass the event data to the template
    })
    .catch(error => {
      console.error('Error fetching event for editing:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/editEventRec/:eventid', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/eventRecords');
  }
  const eventid = req.params.eventid;

  // Extract all fields from the request body
  const {
    startdaterange,
    enddaterange,
    expectedparticipants,
    expectedduration,
    eventactivities,
    address,
    city,
    state,
    zip,
    starttime,
    contactname,
    contactphone,
    contactemail,
    jenshare,
    organization,
    comments,
    spacedescription,
    numsewers,
    nummachines,
    numroundtables,
    numrectanglestables,
    numadults,
    numchildren,
    actualparticipants,
    actualduration,
    eventdate,
    pockets,
    collars,
    envelopes,
    vests,
    completedproducts,
    eventstatus,
  } = req.body;

  // Helper function to parse integers or return a default value
  function toIntOrDefault(value, defaultValue) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  // Define default values for required fields
  const defaultExpectedParticipants = 1; // Example default value
  const defaultExpectedDuration = 1;     // Example default value
  // Add more default values as needed for required fields

  // Input validation for required fields
  const errors = [];

  if (!startdaterange) {
    errors.push('Start date range is required.');
  }

  if (!expectedparticipants) {
    errors.push('Expected participants is required.');
  }

  // Add more validation checks for other required fields
  // For example:
  // if (!address) { errors.push('Address is required.'); }

  if (errors.length > 0) {
    // If there are validation errors, send them back to the client
    res.status(400).json({ errors });
    return;
  }

  // Update the record in the database
  knex('event')
    .where('eventid', eventid)
    .update({
      startdaterange: startdaterange,
      enddaterange: enddaterange || null,
      expectedparticipants: toIntOrDefault(expectedparticipants, defaultExpectedParticipants),
      expectedduration: toIntOrDefault(expectedduration, defaultExpectedDuration),
      eventactivities: eventactivities, // Provide a default empty string if null not allowed
      address: address.toLowerCase() || '',
      city: city.toLowerCase(),
      state: state,
      zip: zip, // Assuming zip is a string
      starttime: starttime || null,
      contactname: contactname.toLowerCase(),
      contactphone: contactphone,
      contactemail: contactemail.toLowerCase(),
      jenshare: jenshare === 'yes', // Convert radio button to boolean
      organization: organization.toLowerCase(),
      comments: comments || '',
      spacedescription: spacedescription.toLowerCase() || '',
      numsewers: toIntOrDefault(numsewers, 0),
      nummachines: toIntOrDefault(nummachines, 0),
      numroundtables: toIntOrDefault(numroundtables, 0),
      numrectanglestables: toIntOrDefault(numrectanglestables, 0),
      numadults: toIntOrDefault(numadults, 0),
      numchildren: toIntOrDefault(numchildren, 0),
      actualparticipants: toIntOrDefault(actualparticipants, 0),
      actualduration: toIntOrDefault(actualduration, 0),
      eventdate: eventdate || null,
      pockets: toIntOrDefault(pockets, 0),
      collars: toIntOrDefault(collars, 0),
      envelopes: toIntOrDefault(envelopes, 0),
      vests: toIntOrDefault(vests, 0),
      completedproducts: toIntOrDefault(completedproducts, 0),
      eventstatus: eventstatus.toLowerCase() || 'pending', // Default to "pending" if not provided
    })
    .then(() => {
      res.redirect('/eventRecords'); // Redirect to the event records page
    })
    .catch((error) => {
      console.error('Error updating event:', error);
      res.status(500).send('Internal Server Error');
    });
});


// Route to display admin records
app.get('/adminRecords', isAuthenticated, isAdmin, (req, res) => {
  if (SHOWCASE) {
    return res.render('adminRecords', { admin: sampleAdmins });
  }
  knex('admin')
    .join('volunteer', 'volunteer.volunteerid', '=', 'admin.volunteerid')
    .select(
      'volunteer.volunteerid',
      'volunteer.firstname',
      'volunteer.lastname',
      'volunteer.phone',
      'volunteer.email',
      'volunteer.city',
      'volunteer.state',
      'admin.username',
      'admin.password',
      'admin.role'
    )
    .then(admin => {
      console.log(admin);
      res.render('adminRecords', { admin });
    })
    .catch(error => {
      console.error('Error querying database:', error);
      res.status(500).send('Internal Server Error');
    });
});


// To post the new volunteer to the database
app.post('/submitVolunteerForm', (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/volunteerRecords');
  }

  // Access each value directly from req.body
  const firstname = req.body.FirstName;

  const lastname = req.body.LastName;

  const phone = req.body.Phone; 

  const email = req.body.Email;

  const city = req.body.City; 

  const state = req.body.state;

  const howtheyheard = req.body.HowTheyHeard;

  const sewinglevel = req.body.SewingLevel;

  const monthlyhrswilling = parseInt(req.body.MonthlyHrsWilling); // Convert to integer

  const leadwilling = req.body.LeadWilling;

  const traveltime = parseInt(req.body.TravelTime); // Convert to integer

  const comments = req.body.Comments || 'No comments';


  // Insert the Volunteer in the database
  knex('volunteer')
    .insert({
      firstname: firstname.toLowerCase(),
      lastname: lastname.toLowerCase(),
      phone: phone,
      email: email.toLowerCase(),
      city: city.toLowerCase(),
      state: state,
      howtheyheard: howtheyheard.toLowerCase(),
      sewinglevel: sewinglevel,
      monthlyhrswilling: monthlyhrswilling,
      leadwilling: leadwilling,
      traveltime: traveltime,
      comments: comments,
    })
    .then(() => {
      if (req.session && req.session.isAuthenticated) {
        res.redirect('/volunteerRecords'); // Redirect to internalLanding if authenticated
      } else {
        res.redirect('/'); // Redirect to login if not authenticated
      }
    })
    .catch(error => {
      console.error('Error adding Volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});


// To post the event request to the database
app.post('/EventRequest', (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/');
  }

  // Access each value directly from req.body
  const startdaterange = req.body.startdaterange;

  const enddaterange = req.body.enddaterange || null;

  const expectedparticipants = parseInt(req.body.expectedparticipants); 

  const expectedduration = parseInt(req.body.expectedduration);

  const eventactivities = req.body.eventactivities; 

  const address = req.body.address;

  const city = req.body.city;

  const state = req.body.state;

  const zip = req.body.zip;

  const contactname = req.body.contactname;

  const contactphone = req.body.contactphone;

  const contactemail = req.body.contactemail;

  const jenshare = req.body.jenshare;

  const organization = req.body.organization;

  const comments = req.body.comments || 'No comments';

  const eventstatus = "pending"

  // Insert the event in the database
  knex('event')
    .insert({
      startdaterange : startdaterange,
      enddaterange : enddaterange,
      expectedparticipants : expectedparticipants,
      expectedduration :expectedduration,
      eventactivities : eventactivities.toLowerCase(),
      address : address.toLowerCase(),
      city : city.toLowerCase(),
      state : state,
      zip : zip,
      contactname : contactname.toLowerCase(),
      contactphone : contactphone,
      contactemail : contactemail.toLowerCase(),
      jenshare : jenshare,
      organization : organization.toLowerCase(),
      comments : comments,
      eventstatus : eventstatus.toLowerCase(),
    })
    .then(() => {
      if (req.session && req.session.isAuthenticated) {
        res.redirect('/eventRecords'); // Redirect to internalLanding if authenticated
      } else {
        res.redirect('/'); // Redirect to login if not authenticated
      } 
    })
    .catch(error => {
      console.error('Error adding event:', error);
      res.status(500).send('Internal Server Error');
    });
});




app.post('/EventRequest', async (req, res) => {
  if (SHOWCASE) {
    return res.redirect('/');
  }
  const { contactemail, contactname, organization } = req.body;

  // Insert into the database as usual...

  try {
      const subject = `Event Request Confirmation for ${organization}`;
      const body = `
          Hi ${contactname},

          Thank you for submitting an event request to the Turtle Shelter Project! We will review your request and get back to you shortly.

          Best regards,
          Turtle Shelter Project Team
      `;

      await sendEmail(contactemail, subject, body);
      res.redirect('/'); // Redirect after successful email and DB operation
  } catch (error) {
      console.error('Error sending confirmation email:', error);
      res.status(500).send('An error occurred while processing your request.');
  }
});

// Route to handle newsletter subscription
app.post('/subscribe', (req, res) => {
  if (SHOWCASE) {
    return res.send('Thank you for subscribing!');
  }
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  // Insert the email into the EmailList table
  knex('emaillist')
    .insert({ email: email.toLowerCase() })
    .then(() => {
      res.send('Thank you for subscribing!');
    })
    .catch(error => {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).send('An error occurred. Please try again later.');
    });
});


// Updated this email connection by taking out the aws secred and id. I need to set up a config with the link to a .env file, 
// otherwise email functionality will no longer work on localhost
const sesClient = new SESClient({
  region: 'us-east-1', // Replace with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mykey',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'my secret',
  },
});
// Function to send a single email
const sendEmail = async (to, subject, body) => {
  const params = {
    Source: 'noreply@turtleshelterproject.net', // Replace with your verified email
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Text: {
          Data: body,
        },
      },
    },
  };

  if (SHOWCASE) {
    console.log(`[SHOWCASE] Email to ${to}: ${subject}`);
    return;
  }
  const command = new SendEmailCommand(params);
  await sesClient.send(command);
  console.log(`Email sent to ${to}`);
};

app.post('/sendMassEmail', async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required.' });
  }

  try {
    if (SHOWCASE) {
      console.log(`[SHOWCASE] Mass email: ${subject}`);
    } else {
      const emails = await knex('emaillist').select('email');
      if (!emails || emails.length === 0) {
        return res.status(404).json({ error: 'No email addresses found in the database.' });
      }
      const emailAddresses = emails.map(e => e.email);
      for (const email of emailAddresses) {
        await sendEmail(email, subject, message);
      }
    }

    console.log('Mass email sent successfully.');
    res.json({ message: 'Emails sent successfully.' });
  } catch (error) {
    console.error('Error sending mass email:', error);
    res.status(500).json({ error: 'An error occurred while sending emails.' });
  }
});

// Route to send an individual email
app.post('/sendEmail', async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'Email, subject, and message are required.' });
  }

  try {
    if (SHOWCASE) {
      console.log(`[SHOWCASE] Individual email to ${email}: ${subject}`);
    } else {
      await sendEmail(email, subject, message);
    }
    console.log(`Email sent successfully to ${email}`);
    res.json({ message: `Email sent successfully to ${email}` });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});




// app listening
app.listen(port, host, () => {
  const lan = getLocalLanIp();
  console.log(`Express app listening on http://${host}:${port}`);
  console.log(`Open from this machine:   http://localhost:${port}`);
  console.log(`Open from your network:   http://${lan}:${port}`);
});
