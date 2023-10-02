const express = require("express");
const globalErrorHandler = require("./controller/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const app = express();

const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const adRouter = require("./routes/adRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const featuredAdRouter = require("./routes/featuredAd");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const savedSearchRoutes = require("./routes/savedSearchRoutes");
const notificationSenderRoutes = require("./routes/notificationSenderRoutes");
const layoutRoutes = require("./routes/layoutRoutes");

const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");

app.set("trust proxy", 1);

app.enable("trust proxy");

app.use(cors({ credentials: true, origin: true }));

app.options("*", cors());

app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use('/api', limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use(compression());

// Routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/ad", adRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/featuredAd", featuredAdRouter);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/savedSearch", savedSearchRoutes);
app.use("/api/v1/notificationSender", notificationSenderRoutes);
app.use("/api/v1/layout", layoutRoutes);

// Define the endpoint where GitHub will send webhook payloads
app.post("/webhook", (req, res) => {
  const { body } = req;
  console.log("worked");

  // Handle the push event from GitHub
  if (body && body.ref === "refs/heads/master.") {
    console.log("Received push event for the master branch.");

    // Execute the update and restart script
    exec("/update_and_restart.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing update_and_restart.sh: ${error}`);
        return res.status(500).send("Internal Server Error");
      }

      console.log(`Update and restart script output: ${stdout}`);
      res.status(200).send("Webhook received and processed successfully");
    });
  } else {
    console.log("Received a push event, but not for the master branch");
    res.status(200).send("Webhook received, but not for the master branch");
  }
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
