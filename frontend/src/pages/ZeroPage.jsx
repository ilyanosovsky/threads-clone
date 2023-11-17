import React, { useState, useEffect } from 'react';
import { Box, Stack, Text, Flex, useColorModeValue, Button, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink, useLocation } from "react-router-dom";
import mixpanel from '../utils/mixpanel';

const MotionBox = motion(Box);

const ZeroPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const location = useLocation();

  useEffect(() => {

    // Identify the user
    mixpanel.identify('guest_user');

    // Set user properties
    mixpanel.people.set({
      '$last_login': new Date(),
    });

    // Track page view
    mixpanel.track('Page View', {
      'Page Path': location.pathname,
    });

    const targetDate = new Date('30 Oct 2023 17:00:00 GMT').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [location]);

  const countdownFinished = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const renderButton = () => {
    if (countdownFinished) {
      return (
        <Button
          as={RouterLink}
          to='/welcome'
          bg={"green.400"}
          color={"white"}
          w='full'
          _hover={{
            bg: "green.500",
          }}
          onClick={() => {
            mixpanel.track('Button Clicked', {
              'Button Type': 'start site',
            });
          }}
        >
          Ура! 14.11.23!
        </Button>
      );
    } else {
      return (
        <Button
          bg={"green.400"}
          color={"white"}
          w='full'
          _hover={{
            bg: "green.500",
          }}
          _disabled={{
            bg: "gray.300",
            color: "gray.500",
            cursor: "not-allowed",
            boxShadow: "none",
            opacity: "0.7",
          }}
          isDisabled={true}
        >
          что же будет...
        </Button>
      );
    }
  };

  return (
    <Flex align={"center"} justify={"center"} my={6} direction="column" h="full">
        <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={useColorModeValue("white", "gray.dark")}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            mb={4}
            mt={20}
        >
            <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }} align={"center"} justify={"center"}>
                скоро что-то будет...
            </Heading>


            <MotionBox
                align={"center"} 
                justify={"center"}
                as="i"
                className="fas fa-heart"
                fontSize="20vw"
                color="blue.500"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0.5,
                }}
                // position="absolute"
                zIndex="0"
            />

            <Box zIndex="1">
                <Text fontSize="4xl" fontWeight="bold" align={"center"} justify={"center"}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </Text>
            </Box>

            <Stack spacing={6} direction={["column", "row"]}>
            {renderButton()}
            </Stack>
        </Stack>
    </Flex>
  );
};

export default ZeroPage;