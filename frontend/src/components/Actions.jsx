import {
	Box,
	Button,
	Flex,
	FormControl,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	Image, // Import Image from Chakra UI
    CloseButton // Import CloseButton from Chakra UI
} from "@chakra-ui/react";
import { Textarea } from '@chakra-ui/react'
import { useState, useRef } from "react";  // Import useRef
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { API_URL } from '../config';
import mixpanel from '../utils/mixpanel';
import { useEffect } from 'react';
import usePreviewImg from "../hooks/usePreviewImg";  // Import usePreviewImg

const Actions = ({ post }) => {
	const user = useRecoilValue(userAtom);
	const [liked, setLiked] = useState(post.likes.includes(user?._id));
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [isLiking, setIsLiking] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	const [reply, setReply] = useState("");

	const showToast = useShowToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();  // Define image preview handling functions
    const imageRef = useRef(null);  // Define a ref for the file input

	useEffect(() => {
        // Identify the user
        mixpanel.identify(user?._id || 'guest_user');

        // Set user properties
        mixpanel.people.set({
            '$last_login': new Date(),
            // ...other properties
        });

    }, [user]);

	const handleLikeAndUnlike = async () => {
		if (!user) return showToast("Error", "You must be logged in to like a post", "error");
		if (isLiking) return;
		setIsLiking(true);

		const token = localStorage.getItem('token'); // Retrieve the JWT token

		try {
			const res = await fetch(`${API_URL}/posts/like/${post._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					'Authorization': `Bearer ${token}`, // Include the JWT token
				},
			});
			const data = await res.json();
			if (data.error) return showToast("Error", data.error, "error");

			// Update like status in local state
			const updatedPosts = posts.map((p) => {
				if (p._id === post._id) {
					return liked 
						? { ...p, likes: p.likes.filter((id) => id !== user._id) }
						: { ...p, likes: [...p.likes, user._id] };
				}
				return p;
			});
			setPosts(updatedPosts);
			setLiked(!liked);

			mixpanel.track(liked ? 'Unlike Clicked' : 'Like Clicked', {
                'Post ID': post._id,
            });

		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLiking(false);
		}
	};

	const handleReply = async () => {
		if (!user) return showToast("Error", "You must be logged in to reply to a post", "error");
		if (isReplying) return;
		setIsReplying(true);
		try {
			const token = localStorage.getItem('token'); // Retrieve the JWT token

			// Check if image size exceeds 10MB (for base64 string)
			if (imgUrl) {
				const sizeInBytes = (imgUrl.length * (3/4)) - (imgUrl.endsWith('==') ? 2 : imgUrl.endsWith('=') ? 1 : 0);
				if (sizeInBytes > 10 * 1024 * 1024) {
					showToast("Error", "Image size exceeds 10MB", "error");
					return;
				}
			}

			const res = await fetch(`${API_URL}/posts/reply/${post._id}/${user._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					'Authorization': `Bearer ${token}`, // Include the JWT token
				},
				body: JSON.stringify({ text: reply, img: imgUrl }),
			});
			const data = await res.json();
			if (data.error) return showToast("Error", data.error, "error");

			const updatedPosts = posts.map((p) => {
				if (p._id === post._id) {
					return { ...p, replies: [...p.replies, data] };
				}
				return p;
			});

            mixpanel.track('Reply Clicked', {
                'Post ID': post._id,
                'Reply Text': reply,
            });

			setPosts(updatedPosts);
			showToast("Success", "Reply posted successfully", "success");
			onClose();
			setReply("");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsReplying(false);
		}
	};

	return (
		<Flex flexDirection='column'>
			<Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
				<svg
					aria-label='Like'
					color={liked ? "rgb(237, 73, 86)" : ""}
					fill={liked ? "rgb(237, 73, 86)" : "transparent"}
					height='19'
					role='img'
					viewBox='0 0 24 22'
					width='20'
					onClick={handleLikeAndUnlike}
				>
					<path
						d='M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z'
						stroke='currentColor'
						strokeWidth='2'
					></path>
				</svg>

				<svg
					aria-label='Comment'
					color=''
					fill=''
					height='20'
					role='img'
					viewBox='0 0 24 24'
					width='20'
					onClick={onOpen}
				>
					<title>Comment</title>
					<path
						d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
						fill='none'
						stroke='currentColor'
						strokeLinejoin='round'
						strokeWidth='2'
					></path>
				</svg>

			</Flex>

			<Flex gap={2} alignItems={"center"}>
				<Text color={"gray.light"} fontSize='sm'>
					{post.replies.length} replies
				</Text>
				<Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
				<Text color={"gray.light"} fontSize='sm'>
					{post.likes.length} likes
				</Text>
			</Flex>

			<Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<Textarea
								placeholder='Reply goes here..'
								value={reply}
								onChange={(e) => setReply(e.target.value)}
							/>
							<Input type='file' hidden ref={imageRef} onChange={handleImageChange} />  {/* File input */}
                            <Box mt={4} onClick={() => imageRef.current.click()} cursor='pointer'> {/* Image input trigger */}
                                Upload Image
                            </Box>
                            {imgUrl && (  // Image preview
                                <Flex mt={5} w={"full"} position={"relative"}>
                                    <Image src={imgUrl} alt='Selected img' />
                                    <CloseButton
                                        onClick={() => {
                                            setImgUrl("");
                                        }}
                                        bg={"gray.800"}
                                        position={"absolute"}
                                        top={2}
                                        right={2}
                                    />
                                </Flex>
                            )}
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme='blue' size={"sm"} mr={3} isLoading={isReplying} onClick={handleReply}>
							Reply
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default Actions;