import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import pinRoutes from './routes/pinRoutes.js'
import boardRoutes from './routes/boardRoutes.js'

dotenv.config()
connectDB()

const app = express()

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static uploads folder
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pins', pinRoutes)
app.use('/api/boards', boardRoutes)

app.get('/', (req, res) => {
    res.send('Pinterest API is running...')
})

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server connected successfully http://localhost:${PORT}`)
})

