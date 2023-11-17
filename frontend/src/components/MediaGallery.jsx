import { SimpleGrid, Box, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const MediaGallery = ({ posts }) => {
    return (
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={5}>
            {posts.filter(post => post.img && post.postedBy).map((post, index) => {
                return (
                    <Box key={post._id} p={2} boxShadow="md">
                        <Link to={`/${post.postedBy.username}/post/${post._id}`}>
                            <Image src={post.img} alt={`Post by ${post.postedBy.username}`} />
                        </Link>
                    </Box>
                );
            })}
        </SimpleGrid>
    );
};

export default MediaGallery;

