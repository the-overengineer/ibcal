# Weekly Calendar

This application is a simple weekly calendar with scheduled appointments, or bookings. It shows a fixed span of a week, starting from tomorrow,
in which bookings can be made. Only certain times are available - working hours are limited to six hours, and each working period includes a
half-hour break during which no reservations can be made. Additionally, Sundays are always non-working days and Saturdays are only working days
if they are on even dates (they day of the month is an even number). The user can only make one booking per day, and only up to two per week.

The application has basic feedback to user actions, such as showing confirmations on successful bookings, or warning and informational notifications
when the user attempts to make an invalid booking (one that is already taken or does not follow the business rules). The application UI also partially
scales to be usable on mobile phones, though it was not designed with mobile-first in mind.

Some simple improvements that could have been made but have been opted out of to keep it simple:

* Prompt the user for confirmation before adding a booking
* Allow the user to remove their booking
* Store the bookings in local storage, instead of resetting them on page refresh
* Highlight the entire current row when the user is hovering it, to make the time detection easier
* Make the header (names of days) sticky or fixed, to make the app more usable when scrolling

Finally, the application uses modern browser features. It has been tested to work in latest Chrome and Firefox, but no guarantees are given that it
will gracefully degrade in older browsers.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!