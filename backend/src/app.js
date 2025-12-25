require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(errorMiddleware);

const tenantRoutes = require('./routes/tenant.routes');

app.use('/api/tenants', tenantRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/api', userRoutes);

app.use("/api/projects", require("./routes/project.routes"));

module.exports = app;
