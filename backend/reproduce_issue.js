import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import http from "http";

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing");
            process.exit(1);
        }
        if (!process.env.JWT_ACCESS_SECRET) {
            console.error("JWT_ACCESS_SECRET is missing");
            process.exit(1);
        }

        // 1. Create a token for the user
        // User ID from previous logs: 6917ee308831d2672f5747bb
        const userId = "6917ee308831d2672f5747bb";
        const token = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
        console.log("Generated Token:", token.substring(0, 20) + "...");

        const port = process.env.PORT || 5000;
        console.log(`Targeting Port: ${port}`);

        // 2. Make the request
        const options = {
            hostname: '127.0.0.1',
            port: port,
            path: '/api/posts/recent/history?limit=10',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        console.log(`Making request to http://127.0.0.1:${port}${options.path}`);

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('BODY:', data);
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        req.end();

    } catch (err) {
        console.error("Error:", err);
    }
};

run();
