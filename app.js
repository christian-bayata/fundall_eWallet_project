import express from 'express';
import {port, environment} from 'settings';

const app = express();

//Init Express Set-up
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(port, () => console.log(`server running on port ${port} in ${environment} mode`))