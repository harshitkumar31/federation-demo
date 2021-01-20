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

  type Topic {
    searchResult: SearchResult
    contentLayout: ContentLayout
    postTopic: PostTopic
  }

  type PostTopic {
    id: String
    name: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    },
    topic() {
      return {
        id: 'id',
        name: 'name',
      };
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
    }
  },
  Topic: {
    searchResult() {
      return {
        __typename: 'SearchResult',
        query: 'query'
      };
    },
    contentLayout() {
      return {
        __typename: 'ContentLayout',
        moduleId: 'moduleId'
      };
    },
    postTopic(parent) {
      // TODO. We really want to get data of contentLayout and searchResult here.
      // return `${parent?.contentLayout?.moduleId} has ${parent?.searchResult?.itemStacks?.length} items`;
      return parent;
    },
  },
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
