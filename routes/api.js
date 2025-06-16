/*
'use strict';

module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
*/

'use strict';


const Thread = require('../models/Thread');

module.exports = function (app) {

  app.route('/api/threads/:board')
    .post(async (req, res) => {
  try {
    const { text, delete_password } = req.body;
    const board = req.params.board;
    const now = new Date();

    const newThread = new Thread({
      board,
      text,
      created_on: now,
      bumped_on: now,
      reported: false,
      delete_password,
      replies: []
    });

    await newThread.save();
    res.redirect(`/b/${board}/`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
})


    .get(async (req, res) => {
      const board = req.params.board;
      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .select('-delete_password -reported')
        .lean();

      threads.forEach(thread => {
        thread.replies = thread.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);

        thread.replies.forEach(r => {
          delete r.delete_password;
          delete r.reported;
        });
      });

      res.json(threads);
    })

    .delete(async (req, res) => {
      const { thread_id, delete_password } = req.body;
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      if (thread.delete_password !== delete_password) return res.send('incorrect password');

      await Thread.findByIdAndDelete(thread_id);
      res.send('success');
    })

    .put(async (req, res) => {
      await Thread.findByIdAndUpdate(req.body.thread_id, { reported: true });
      res.send('reported');
    });

  app.route('/api/replies/:board')
    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const now = new Date();
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      thread.replies.push({
        text,
        created_on: now,
        delete_password,
        reported: false,
      });

      thread.bumped_on = now;
      await thread.save();
      res.redirect(`/b/${req.params.board}/${thread_id}`);
    })

    .get(async (req, res) => {
      const { thread_id } = req.query;
      const thread = await Thread.findById(thread_id)
        .select('-delete_password -reported')
        .lean();

      if (!thread) return res.send('Thread not found');

      thread.replies.forEach(reply => {
        delete reply.delete_password;
        delete reply.reported;
      });

      res.json(thread);
    })

    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const thread = await Thread.findById(thread_id);
      if (!thread) return res.send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply || reply.delete_password !== delete_password) return res.send('incorrect password');

      reply.text = '[deleted]';
      await thread.save();
      res.send('success');
    })

    .put(async (req, res) => {
      const { thread_id, reply_id } = req.body;
      const thread = await Thread.findById(thread_id);
      const reply = thread.replies.id(reply_id);
      if (!reply) return res.send('Reply not found');

      reply.reported = true;
      await thread.save();
      res.send('reported');
    });
};
