import React, { useEffect, useState } from "react";
import axios from "axios";
import isEmpty from "lodash/isEmpty";
import { StarIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

import getCurrentDimension from "../utils/getCurrentDimention";

type repoType = {
  name: string;
  description: string;
  stargazers_count: string;
};

type usersDataType = {
  id: string;
  login: string;
  repositories: repoType[];
};

const ListUsersView = () => {
  const toast = useToast();
  const [screenSize, setScreenSize] = useState(getCurrentDimension());
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState<usersDataType[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDimension = () => {
        setScreenSize(getCurrentDimension());
      };
      window.addEventListener("resize", updateDimension);

      return () => {
        window.removeEventListener("resize", updateDimension);
      };
    }
  }, [screenSize]);

  const getUsersList = async () => {
    setIsLoading(true);
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_GITHUB_URL}/search/users?q=${searchValue}`
      )
      .then((result) => {
        const getRepoData = result?.data?.items?.map(
          async (item: { repos_url: string }) => {
            let repositories: [] = [];
            await axios
              .get(item.repos_url, {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                },
              })
              .then((res) => {
                repositories = res.data;
              });

            return { ...item, repositories };
          }
        );

        Promise.all(getRepoData).then(function (results) {
          setUsersData(results);
          isEmpty(results) &&
            toast({
              title: `Search with keyword "${searchValue}" not found`,
              position: "top",
              isClosable: true,
            });

          setIsLoading(false);
        });
      });
  };

  return (
    <Flex bg="#f3f3f3" justifyContent="center">
      <Box
        minHeight="100vh"
        maxWidth={screenSize.width > 500 ? "80vw" : "100%"}
        w="100%"
      >
        <Box bg="white" p={4}>
          <Heading as="h4" size="md">
            Search Github Repository
          </Heading>
        </Box>
        <Box bg="white" mt={4} p={4}>
          <FormControl>
            <FormLabel>Github Username</FormLabel>
            <Input
              type="search"
              onBlur={(searchEvent) => setSearchValue(searchEvent.target.value)}
            />
            <FormHelperText>Insert Github Username</FormHelperText>
            <Button
              colorScheme="teal"
              size="md"
              mt={4}
              width="100%"
              onClick={() => getUsersList()}
              isLoading={isLoading}
            >
              Search
            </Button>
          </FormControl>
        </Box>
        {!isEmpty(usersData) && (
          <Box bg="white" mt={4} p={4}>
            <Text fontSize="lg">
              Showing users for &quot;{searchValue}&quot;
            </Text>
            <Accordion mt={6} defaultIndex={[0]} allowMultiple>
              {usersData?.map((data) => {
                return (
                  <AccordionItem key={data.id}>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          <Heading as="h3" size="sm">
                            {data.login}
                          </Heading>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {!isEmpty(data.repositories) ? (
                        data.repositories.map((repo, key: number) => {
                          return (
                            <Box key={key} bg="#ebebeb" my={4} p={6}>
                              <HStack w="100%" justifyContent="space-between">
                                <Stack>
                                  <Heading as="h6" size="sm">
                                    {repo.name}
                                  </Heading>
                                  <Text>{repo.description}</Text>
                                </Stack>

                                <HStack>
                                  <Heading as="h5" size="sm">
                                    {repo.stargazers_count}
                                  </Heading>
                                  <StarIcon />
                                </HStack>
                              </HStack>
                            </Box>
                          );
                        })
                      ) : (
                        <Text fontSize="md">No Repository Found</Text>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default ListUsersView;
