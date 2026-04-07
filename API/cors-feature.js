const cors = require("cors");

const corsFeature = (app)=>{

   const corsOptions = {
      origin: "*",
      optionsSuccessStatus: 200,
      methods: ["OPTIONS", "GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
      allowedHeaders: [
        "Content-Type",
        "x-requested-with",
        "Authorization",
        "Accept",
        "token",
      ],
      maxAge: 86400,
    };
    
   app.use(cors(corsOptions));

   app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });
  

}

module.exports = corsFeature;