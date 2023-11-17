import React, { useState, useEffect } from 'react';
import {
    Button,
    Flex,
    Heading,
    Stack,
    useColorModeValue,
    Text,
    Box,
    VStack,
    HStack,
    Link
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import {
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
  } from '@chakra-ui/react'
  import mixpanel from '../utils/mixpanel';

const steps = [
    { title: 'First', description: 'step' },
    { title: 'Second', description: 'step' },
    { title: 'Third', description: 'step' },
];

const WelcomePage = () => {

    const navigate = useNavigate();

    useEffect(() => {
        // Identify the user
        mixpanel.identify('guest_user');
    
        // Set user properties
        mixpanel.people.set({
          '$last_login': new Date(),
        });
    
        // Track page view
        mixpanel.track('Page View', {
          'Page Path': '/welcome',
        });
        
        // ... rest of your useEffect code, if any
      }, []);

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });

    const handleNextStep = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
        } else {
            console.log("finish");
            navigate('/home');
        }
        mixpanel.track('Button Clicked', {
            'Button Type': 'welcome steps',
        });
    };

    const handlePreviousStep = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1);
        }
        mixpanel.track('Button Clicked', {
            'Button Type': 'welcome steps',
        });
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
            >
                <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }} align={"center"} justify={"center"}>
                    Welcome Bella 💙💙💙
                </Heading>

                {/* Conditional rendering of content based on activeStep */}
                {activeStep === 0 && <Text align={"center"} textAlign="justify">
                    Привет 💙 если ты это читаешь, значит каким-то образом мне удалось передать тебе блокнот с комиксом и ты весь его просмотрела… <br/> <br/>
                    Вернемся к сайту. Нажми на 💙 сверху, если хочешь сменить цвета. <br/> <br/>
                    Сайт можно открывать и с компа, сделал его я, поэтому не суди очень строго, я только учусь и переходи на следующий шаг 💙
                    </Text>}
                {activeStep === 1 && <Text align={"center"} textAlign="justify">
                    Должен тебя предупредить, там будет очень много текста, мыслей, эмоций, накопленных за последние пол года... <br/> <br/>
                    Чтобы лучше передать тебе атмосферу, в которой я все это делал, предлагаю тебе скачать этот плейлист, включить его в любом порядке и переходить к следующему шагу. <br/> <br/>
                    <Text align={"center"} fontSize={{ base: "xl", sm: "xl" }}>
                        <Link href="https://music.yandex.com/users/TitanPro10/playlists/1009?utm_medium=copy_link" isExternal color="blue.500">💙 Download Playlist 💙</Link>
                    </Text>
                </Text>}
                {activeStep === 2 && <Text align={"center"} textAlign="justify">
                    Ну вот и остался последний шаг, прежде чем ты погрузишься в этот сайт. <br/> <br/>
                    На следующем этапе тебе нужно будет войти в созданный мной аккаунт, я тебе немного помогу в этом. <br/> 
                        <p align="center">username: <Text as='b' fontSize={{ base: "xl", sm: "xl" }}>bella</Text></p> 
                    A вот пароль - это дата, наша дата, состоит из 6 цифр (ддммгг). Попыток у тебя не ограничено. Удачи и увидимся внутри 💙   
                </Text>}

                <HStack mt={4} spacing={4} justify={"center"}>
                    <Button onClick={handlePreviousStep} isDisabled={activeStep === 0}>
                        Back
                    </Button>
                    <Button colorScheme="blue" onClick={handleNextStep}>
                        {activeStep < steps.length - 1 ? "Next" : "Login"}
                    </Button>
                </HStack>

            </Stack>

            <VStack
                w={"full"}
                maxW={"md"}
                align="center"
                spacing={4}
                position="fixed"
                bottom={8}
                left="50%"
                transform="translateX(-50%)"
            >
                <Stepper size='lg' index={activeStep}>
                    {steps.map((step, index) => (
                        <Step key={index}>
                            <StepIndicator>
                                <StepStatus
                                    complete={<StepIcon />}
                                    incomplete={<StepNumber />}
                                    active={<StepNumber />}
                                />
                            </StepIndicator>

                            <Box flexShrink='0'>
                                <StepTitle>{step.title}</StepTitle>
                                <StepDescription>{step.description}</StepDescription>
                            </Box>

                            {index < steps.length - 1 && <StepSeparator />}
                        </Step>
                    ))}
                </Stepper>

            </VStack>
        </Flex>
    );
}

export default WelcomePage;