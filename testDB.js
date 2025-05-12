import connectDB from './lib/mongodb';


(async () => {
  try {
    const db = await connectDB();
    console.log('✅ Connected to MongoDB successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();
