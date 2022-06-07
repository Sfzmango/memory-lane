const { AuthenticationError } = require('apollo-server-express');
const { User, Timeline } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = { 
    Query: {
        user: async (parent, { userId }) => {
            return User.findOne({ _id: userId });
        },
        timeline: async (parent, { timelineId }) => {
            return Timeline.findOne({ _id: timelineId });
        },
        users: async () => {
            return await User.find({});
        },
        timelines: async () => {
            return await Timeline.find({});
        }   
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return {token, user};
        },
        addTimeline: async (parent, args) => {
            return Timeline.create(args);
        },
        addMoment: async (parent, { timelineId, title, description, imageLink, year, month, day }) => {
            return Timeline.findOneAndUpdate(
                { _id: timelineId },
                { $addToSet: { moments: { title, description, imageLink, year, month, day } } },
                { new: true }
            );
        },
        deleteTimeline: async (parent, { timelineId }) => {
            return Timeline.findOneAndDelete({ _id: timelineId });
        },
        deleteMoment: async (parent, { timelineId, momentId }) => {
            return Timeline.findOneAndUpdate(
                { _id: timelineId },
                { $pull: { moments: { _id: momentId }}},
                { new: true }
            );
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect login credentials!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect login credentials!');
            }

            const token = signToken(user);

            return {token, user};
        }
    }
};

module.exports = resolvers;