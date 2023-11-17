import { Avatar, Divider, Flex, Text, Image, Box, IconButton } from "@chakra-ui/react";
import { format } from 'date-fns';  // Import formatDistanceToNow
import { DeleteIcon } from "@chakra-ui/icons";  // Import DeleteIcon
import { useRecoilValue } from "recoil";  // Import useRecoilValue
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";  // Import userAtom
import postsAtom from "../atoms/postsAtom";
import { API_URL } from '../config';  // Import API_URL
import useShowToast from "../hooks/useShowToast";  // Import useShowToast

const Comment = ({ reply, lastReply, postId, replyIndex, onReplyDelete }) => {
    const formattedDate = reply.createdAt ? format(new Date(reply.createdAt), "dd/MM/yyyy - HH:mm") : "Unknown date";
    const currentUser = useRecoilValue(userAtom);  // Get current user from recoil state
    const showToast = useShowToast();  // Initialize toast hook
	const setPosts = useSetRecoilState(postsAtom);

	console.log(reply.createdAt);
	console.log(reply);
	const handleDeleteReply = async () => {
		try {
			if (!window.confirm("Are you sure you want to delete this reply?")) return;
			console.log(postId, replyIndex);

			const token = localStorage.getItem('token'); // Retrieve the JWT token

			const res = await fetch(`${API_URL}/posts/deleteReply/${postId}/${replyIndex}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					'Authorization': `Bearer ${token}`, // Include the JWT token
				},
			});
	
			if (!res.ok) {
				const text = await res.text();  // Read the response body as text
				showToast("Error", `Server responded with status code ${res.status}: ${text}`, "error");
				return;
			}
	
			// Since res.ok is true, it's safe to assume the body contains JSON
			const data = await res.json();
			showToast("Success", "Reply deleted", "success");
	
			// Update the postsAtom to reflect the deletion
			setPosts((prevPosts) => {
				return prevPosts.map((post) => {
					if (post._id === postId) {
						// Create a new post object with the reply removed
						return {
							...post,
							replies: post.replies.filter((_, index) => index !== replyIndex)
						};
					}
					return post;  // Return the original post object for all other posts
				});
			});
	
			onReplyDelete(replyIndex);
	
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

    return (
        <>
            <Flex gap={4} py={2} my={2} w={"full"}>
                <Avatar src={reply.userProfilePic} size={"sm"} />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text fontSize='sm' fontWeight='bold'>
                            {reply.username}
                        </Text>
                        <Flex gap={4} alignItems={"center"}>  {/* Wrap DeleteIcon and time in a Flex container */}
                            <Text fontSize='xs' color='gray.500'>  {/* Display the time */}
								{formattedDate}
                            </Text>
                            {currentUser?._id === reply.userId && (  // Show delete icon if currentUser is the reply owner
                                <DeleteIcon 
                                    aria-label="Delete reply"
                                    size={5}
                                    onClick={handleDeleteReply}
                                />
                            )}
                        </Flex>
                    </Flex>
                    <Text>{reply.text}</Text>
                    {reply.img && (  // Check if there is an image and display it
                        <Box borderRadius={6} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"}>
                            <Image src={reply.img} w={"full"} />
                        </Box>
                    )}
                </Flex>
            </Flex>
            {!lastReply ? <Divider /> : null}
        </>
    );
};

export default Comment;