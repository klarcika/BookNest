const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();
app.use(express.json());

const { swaggerUi, swaggerDocs } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected to recommendation-service"))
    .catch((err) => console.error(err));

app.use("/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () =>
    console.log(`Recommendation service running on port ${PORT}`)
);
