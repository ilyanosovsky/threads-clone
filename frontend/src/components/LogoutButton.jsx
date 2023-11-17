import { Button } from "@chakra-ui/button";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";
import { API_URL } from '../config';

const LogoutButton = () => {
	const setUser = useSetRecoilState(userAtom);
	const showToast = useShowToast();

	const handleLogout = () => {
		try {
			localStorage.removeItem('token'); // Remove the token from local storage
			setUser(null); // Update the user state to null
			showToast("Success", "Logged out successfully", "success");
		} catch (error) {
			showToast("Error", error.message || "An error occurred during logout", "error");
		}
	};
	
	return (
		<Button position={"fixed"} top={"30px"} right={"30px"} size={"sm"} onClick={handleLogout}>
			<FiLogOut size={20} />
		</Button>
	);
};

export default LogoutButton;