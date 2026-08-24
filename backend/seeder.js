import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = 'WanderSync Admin';
      existingAdmin.password = 'admin123';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated successfully');
    } else {
      await User.create({
        name: 'WanderSync Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        preferences: {
          travelStyle: 'luxury',
          currency: 'USD'
        }
      });
      console.log('Admin user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
