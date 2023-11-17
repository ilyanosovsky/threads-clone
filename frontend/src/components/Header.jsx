import React, { useState, useEffect } from 'react';
import { Button, Flex, Image, Link, useColorMode, Avatar, Box, Text, Badge, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody } from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome, AiOutlineBell } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { API_URL } from '../config';
import { format } from 'date-fns';

const Header = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useRecoilValue(userAtom);
	const logout = useLogout();
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const location = useLocation();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve the JWT token
                const response = await fetch(`${API_URL}/notification`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the JWT token
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setNotifications(data);
                setNotificationCount(data.length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the JWT token
            await fetch(`${API_URL}/notification/markAsRead`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the JWT token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId: notification._id }),
            });
    
            setNotifications(notifications.filter(n => n._id !== notification._id));
            setNotificationCount(notificationCount - 1);
            navigate(notification.link);
            onClose();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    
    
	return (
        <Flex justifyContent={"space-between"} mt={6} mb='12'>
                <>
                    {user ? (
                        <Link as={RouterLink} to='/'>
                            <AiFillHome size={24} />
                        </Link>
                    ) : (
                        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
                            Login
                        </Link>
                    )}

                    <Image
                        cursor={"pointer"}
                        alt='logo'
                        w={6}
                        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                        onClick={toggleColorMode}
                    />
                    {user ? (
                        <Flex alignItems={"center"} gap={4}>
                        <Box position="relative">
                            <AiOutlineBell size={24} onClick={onOpen} cursor="pointer" />
                            {notificationCount > 0 && (
                                <Badge colorScheme="red" variant='solid' position="absolute" top="-1" right="-1" borderRadius="full">
                                    {notificationCount}
                                </Badge>
                            )}
                        </Box>
                            <Link as={RouterLink} to={`/${user.username}`}>
                                <RxAvatar size={24} />
                            </Link>
                            <Button size={"xs"} onClick={logout}>
                                <FiLogOut size={20} />
                            </Button>
                        </Flex>
                    ) : (
                        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
                            Sign up
                        </Link>
                    )}

                            {/* Notification Drawer */}
                    <Drawer placement='right' onClose={onClose} isOpen={isOpen}>
                        <DrawerOverlay />
                        <DrawerContent>
                            <DrawerHeader borderBottomWidth='1px'>Notifications</DrawerHeader>
                            <DrawerBody>
                                {notifications.length === 0 ? (
                                    <Box p={2}>No new notifications.</Box>
                                ) : (
                                    notifications.map(notification => (
                                        <Flex key={notification._id} p={2} onClick={() => handleNotificationClick(notification)} align="center">
                                            <Avatar src={notification.actionUser.profilePic} alt="User Avatar" boxSize="40px" mr={2} />
                                            <Box flex="1">
                                                <Text>{notification.content}</Text>
                                                <Text color="gray.600" fontSize="sm">
                                                    {notification.snippet}
                                                </Text>
                                                <Text color="gray.500" fontSize="sm">
                                                    {format(new Date(notification.createdAt), "dd/MM/yyyy - HH:mm")}
                                                </Text>
                                            </Box>
                                        </Flex>
                                    ))
                                )}
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>
                </>
        </Flex>
	);
};

export default Header;