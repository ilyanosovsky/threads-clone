import { Box, Flex, Spinner, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState, useRecoilValue } from "recoil";
import postsAtom from "../atoms/postsAtom";
import userAtom from "../atoms/userAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import { API_URL } from '../config';
import useScrollRestoration from "../hooks/useScrollRestoration";
import mixpanel from '../utils/mixpanel';

const HomePage = () => {
	const [posts, setPosts] = useRecoilState(postsAtom);
	const user = useRecoilValue(userAtom);
	const [loading, setLoading] = useState(true);
	const showToast = useShowToast();

	//scroll function
	useScrollRestoration();

//need to add analytics
	useEffect(() => {

        // Identify the user
        mixpanel.identify(user?._id || 'guest_user');

        // Set user properties
        mixpanel.people.set({
            '$last_login': new Date(),
            // ...other properties
        });

        // Track page view
        mixpanel.track('Page View', {
            'Page Path': '/',
        });


		const getFeedPosts = async () => {
			setLoading(true);
			setPosts([]);
			try {
				const userId = user._id;
				const res = await fetch(`${API_URL}/posts/feed/${userId}`);
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
		
				// Check if the response is an array
				if (Array.isArray(data)) {
					setPosts(data);
				} else {
					showToast("Error", "Unexpected response from the server", "error");
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoading(false);
			}
		};		
		getFeedPosts();
	}, [showToast, setPosts, user]);

	return (
		<Flex gap='10' alignItems={"flex-start"}>
			<Box flex={70}>
				{!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

				{loading &&
					[0, 1, 2, 3, 4].map((_, idx) => (
						<Flex key={idx} gap={2} p={"5"} borderRadius={"md"}>
							<Box>
								<SkeletonCircle size={"10"} />
								
							</Box>
							<Flex w={"full"} flexDirection={"column"} gap={2}>
								<SkeletonText mt='4' noOfLines={10} spacing='4' skeletonHeight='2' />
							</Flex>
						</Flex>
					))}

				{posts.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} />
				))}
			</Box>
			<Box
				flex={30}
				display={{
					base: "none",
					md: "block",
				}}
			>
				<SuggestedUsers />
			</Box>
		</Flex>
	);
};

export default HomePage;