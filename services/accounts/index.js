const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    me: User
    topic: Topic
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }

  extend type SearchResult @key(fields: "query") {
    query: String! @external
  }

  extend type ContentLayout @key(fields: "moduleId") {
    moduleId: String! @external
  }

  extend type SearchService @key(fields: "id") {
    id: String! @external
    searchResult: SearchResult @external
    contentLayout: ContentLayout @external
    # composite directive
    postTopic: String @requires(fields: "searchResult { itemStacks }, contentLayout { moduleId rawConfig }")
  }

  type PostTopic {
    id: String
    name: String
  }

  type Topic {
    searchService: SearchService
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    },
    topic() {
      return 'Topic';
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
    }
  },
  Topic: {
    searchService() {
      return {
        __typename: 'SearchService',
        id: 'query'
      };
    },
  },
  SearchService: {
    postTopic(parent) {
      return `${parent?.contentLayout?.moduleId} has ${parent?.searchResult?.itemStacks?.length} items`;
    },
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
];
