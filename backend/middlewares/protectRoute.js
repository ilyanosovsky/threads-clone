import { verifyToken } from "../utils/helpers/generateTokenAndSetCookie.js";

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.userId;
    next();
};

export default authenticate;