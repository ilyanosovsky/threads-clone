import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useShowToast from "./useShowToast";
import { API_URL } from '../config';

const useGetUserProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const { username } = useParams();
	const showToast = useShowToast();

	useEffect(() => {
		const getUser = async () => {
			try {
				const res = await fetch(`${API_URL}/users/profile/${username}`, {
					// credentials: 'include'
				});
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				setUser(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};
		getUser();
	}, [username, showToast]);

	return { loading, user };
};

export default useGetUserProfile;