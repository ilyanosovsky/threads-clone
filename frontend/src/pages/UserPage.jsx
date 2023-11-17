import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import Post from "../components/Post";
import MediaGallery from "../components/MediaGallery";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import { API_URL } from '../config';
import useScrollRestoration from "../hooks/useScrollRestoration";

const UserPage = () => {
	const { user, loading } = useGetUserProfile();
	const { username } = useParams();
	const showToast = useShowToast();
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [fetchingPosts, setFetchingPosts] = useState(true);
	const [tabIndex, setTabIndex] = useState(0); // For managing tabs
	// const token = localStorage.getItem('user-threads');

	//scroll function
	useScrollRestoration();

	const handleTabChange = (index) => {
        setTabIndex(index);
    };

	useEffect(() => {
		const getPosts = async () => {
			setFetchingPosts(true);
			try {
				const res = await fetch(`${API_URL}/posts/user/${username}`, {
					// credentials: 'include',
					// headers: {
					// 	'Authorization': `Bearer ${token}`
					//   }
				});
				const data = await res.json();

				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setFetchingPosts(false);
			}
		};

		getPosts();
	}, [username, showToast, setPosts]);

	if (!user && loading) {
		return (
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"} />
			</Flex>
		);
	}
	if (!user && !loading) return <h1>User not found</h1>;

	return (
		<>
			<UserHeader user={user} />

			{!fetchingPosts && posts.length === 0 && <h1>User has not posts.</h1>}
			{fetchingPosts && (
				<Flex justifyContent={"center"} my={12}>
					<Spinner size={"xl"} />
				</Flex>
			)}

            <Tabs index={tabIndex} onChange={handleTabChange} isFitted>
                <TabList>
                    <Tab>Your Feed</Tab>
                    <Tab>Your Gallery</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {/* Render Feed Posts */}
                        {posts.map((post) => (
                            <Post key={post._id} post={post} postedBy={post.postedBy} />
                        ))}
                    </TabPanel>
                    <TabPanel>
                        {/* Render Media Gallery */}
                        <MediaGallery posts={posts} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
		</>
	);
};

export default UserPage;