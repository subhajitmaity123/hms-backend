import jwt from "jsonwebtoken";

export const generateToken = (user, message, statusCode, res) => {
  // Ensure the JWT secret key is defined
  

  // Remove sensitive fields before storing user data in the token
  const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;

  // Generate JWT token with full user data (excluding password)
  const token = jwt.sign(userWithoutPassword, "process.env.JWT_SECRET", {
    expiresIn: "1d", // Token expires in 1 day
  });

  // Determine the cookie name based on the user's role:
  const cookieName =
  user.role === "Admin"
    ? "adminToken"
    : user.role === "Doctor"
    ? "doctorToken"
    : "patientToken";


  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      sameSite: "strict",
    })
    .json({
      success: true,
      message,
      user: userWithoutPassword,
      token,
    });
};
