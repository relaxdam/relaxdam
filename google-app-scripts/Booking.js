const SPREADSHEET_ID = '1wFi0tPofqM9VX8c-vHonk5pvUTrGwLXmH1Cmbl4iM2A';

function doGet(request) {

  if (request.parameter.action === 'getReviews') {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID); // Replace with your Google Sheets ID
    const reviewsSheet = sheet.getSheetByName('Reviews'); // Ensure you have a sheet named "Reviews"
    const reviews = reviewsSheet.getDataRange().getValues(); // Fetch all rows of data

    // Prepare an array to store the review data
    const reviewsArray = [];

    // Loop through the data and build the review objects
    for (let i = 1; i < reviews.length; i++) {
      const review = {
        timestamp: reviews[i][0],
        reviewText: reviews[i][1], // Review text in third column
        rating: reviews[i][2], // Rating in second column
        name: reviews[i][3] // Assuming name is in the first column
      };
      reviewsArray.push(review);
    }

    // Return the reviews as JSON
    return ContentService.createTextOutput(JSON.stringify(reviewsArray))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  //TODO: list timeslots
  return ContentService.createTextOutput(
    JSON.stringify({test: 'test'})
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(request) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Bookings");

  const {name, email, phone, date, time} = JSON.parse(request.postData.contents);

  // Check for conflicts
  const existingBookings = sheet.getDataRange().getValues();
  const isSlotTaken = existingBookings.some((row) => row[3] === date && row[4] === time);

  if (isSlotTaken) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "FAILED", message: "Time slot is already booked." })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([name, email, phone, date, time]);

  const bookingId = email;//`${Date.now()}`; // Simple unique ID

  // Send email
  MailApp.sendEmail({
    to: "lesiaengineer@gmail.com",
    subject: "New Booking",
    body: `New booking confirmed:\n\nName: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}`
  });

  MailApp.sendEmail({
    to: email,
    subject: "Booking Confirmation",
    body: `Dear ${name},\n\nYour booking is confirmed.\n\nDetails:\nDate: ${date}\nTime: ${time}\nBooking ID: ${bookingId}\n\nThank you for choosing Relaxdam!`
  });

  return ContentService.createTextOutput(
    JSON.stringify({ status: "SUCCESS", message: "Booking added!" })
  ).setMimeType(ContentService.MimeType.JSON);
}
