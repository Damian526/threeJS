const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

app.get("/getDumpPoints", async (req, res) => {
  try {
    const apiUrl =
      "https://walli-dataapi-dev.azurewebsites.net/api/Point3dProvider/GetDumpPoints";

   
    const response = await axios.get(apiUrl, {
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Content-Type": "application/json", 
      },
    });

    res.json(response.data);
   console.log(response.data)
  } catch (error) {
    console.error("Error making the request:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
const corsOptions = {
    origin: '*', 
  };
  
  app.use(cors(corsOptions));
  
  // Parse JSON in the request body
  app.use(express.json());
  
  app.post('/setGridMarkers', async (req, res) => {
    const apiUrl = 'https://walli-dataapi-dev.azurewebsites.net/api/Point3dProvider/SetGridMarkers';
  
   
    const postData = req.body;
  
    try {
      const response = await axios.post(apiUrl, postData);
  
      res.status(response.status).json({
        status: 'success',
        data: {
          postData,
        },
      });
      console.log(postData)
    } catch (error) {
      // Handle errors here
      console.error('Error making the request:', error.message);
  
      // Return an error response as JSON
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
