import userAtom from "../atoms/userAtom";
import { useSetRecoilState } from "recoil";
import useShowToast from "./useShowToast";

const useLogout = () => {
    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();

    const logout = () => {
        try {
            // Remove the JWT token from localStorage
            localStorage.removeItem('token');

            // Update state to reflect the user is logged out
            setUser(null);

            // Optionally, show a success message
            showToast("Success", "Logged out successfully", "success");
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return logout;
};

export default useLogout;