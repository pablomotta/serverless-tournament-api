import { DynamoDB } from 'aws-sdk';
import express from 'express';
import serverless from 'serverless-http';

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClient = new DynamoDB.DocumentClient();

app.use(express.json());

app.get('/users/:userId', async function (req, res) {
	const params: DynamoDB.DocumentClient.GetItemInput = {
		TableName: USERS_TABLE as string,
		Key: {
			userId: req.params.userId,
		},
	};

	try {
		const { Item } = await dynamoDbClient.get(params).promise();
		if (Item) {
			const { userId, name, tournaments } = Item;
			res.json({ userId, name, tournaments });
		} else {
			res.status(404).json({
				error: 'Could not find user with provided "userId"',
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Could not retrieve user' });
	}
});

app.post('/users', async function (req, res) {
	const { userId, name, tournaments } = req.body;
	if (typeof userId !== 'string') {
		res.status(400).json({ error: '"userId" must be a string' });
	} else if (typeof name !== 'string') {
		res.status(400).json({ error: '"name" must be a string' });
	}

	const params: DynamoDB.DocumentClient.PutItemInput = {
		TableName: USERS_TABLE as string,
		Item: {
			userId: userId,
			name: name,
			tournaments: tournaments,
		},
	};

	try {
		await dynamoDbClient.put(params).promise();
		res.json({ userId, name, tournaments });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Could not create user' });
	}
});

app.use((req, res, next) => {
	return res.status(404).json({
		error: 'Not Found',
	});
});

module.exports.handler = serverless(app);
