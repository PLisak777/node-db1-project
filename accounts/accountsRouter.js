const express = require('express');
const router = express.Router();
const db = require('../data/dbConfig');

router.use('/:id', checkId);

async function getQuery(sortby = 'id', sortdir = 'asc', limit = false) {
	if (limit) {
		return await db('accounts').orderBy(sortby, sortdir).limit(limit);
	} else {
		return await await db('accounts').orderBy(sortby, sortdir);
	}
}

router.get('/', async (req, res) => {
	try {
		const { query } = req;
		const accounts = await getQuery(query.sortby, query.sortdir, query.limit);
		res.status(200).json(accounts);
	} catch (err) {
		res.status(500).json({
			message: 'Something went wrong!',
			error: err,
		});
	}
});

router.get('/:id', (req, res) => {
	res.status(200).json(req.account);
});

router.post('/', verifySchema, async (req, res) => {
	try {
		const account = req.body;
		const [id] = await db('accounts').insert(account);
		res.status(201).json(await db('accounts').where({ id })[0]);
	} catch (err) {
		res.status(500).json({
			message: 'Something went wrong!',
			error: err,
		});
	}
});

router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const count = await db('accounts').update(req.body).where({ id });
		const [account] = await db('accounts').where({ id });
		res.status('200').json({
			message: `Successfully updated ${count} account${count > 1 ? 's' : ''}`,
			account,
		});
	} catch (err) {
		res.status(500).json({
			message: 'Something went wrong!',
			error: err,
		});
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const count = await db('accounts').del().where({ id });
		res
			.status('200')
			.json(`Successfully deleted ${count} account${count > 1 ? 's' : ''}`);
	} catch (err) {
		res.status(500).json({
			message: 'Something went wrong!',
			error: err,
		});
	}
});

async function checkId(req, res, next) {
	try {
		const { id } = req.params;
		const account = await db('accounts').where({ id });
		if (account.length > 0) {
			req.account = account[0];
			next();
		} else {
			res.status(404).json({
				message: 'An account with that id does not exist',
			});
		}
	} catch (err) {
		res.status(500).json({
			message: 'Something went wrong!',
			error: err,
		});
	}
}

function verifySchema(req, res, next) {
	if (req.body.name && req.body.budget) {
		next();
	} else {
		res.status(400).json({
			message: 'Please submit an account with a name and a budget',
		});
	}
}

module.exports = router;
