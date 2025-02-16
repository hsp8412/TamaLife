import { SerialPort } from 'serialport';
import { User } from "../models/user";

// Initialize serial port once
const port = new SerialPort({
  path: '/dev/cu.usbmodem142401', // Confirm correct port
  baudRate: 9600
});

// Handle serial port errors
port.on('error', (err) => {
  console.error('Serial Port Error:', err);
});

export const getStates = async (req, res) => {
  try {
    const userId = process.env.DEMO_USER_ID;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Format data as "HP,mood\n"
    const dataString = `${user.healthPoints},${user.mood}\n`;
    
    // Write to serial port
    port.write(dataString, (err) => {
      if (err) {
        console.error('Write Error:', err);
        return res.status(500).json({ error: 'Failed to send data to Arduino' });
      }
      console.log('Data Sent:', dataString.trim());
      res.status(200).json({ HP: user.healthPoints, mood: user.mood });
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};