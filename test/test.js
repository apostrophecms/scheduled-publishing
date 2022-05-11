const assert = require('assert');
const t = require('apostrophe/test-lib/util');

describe('Apostrophe Scheduled Publishing', function() {
  let apos;

  this.timeout(t.timeout);

  before(async function () {
    apos = await t.create({
      root: module,
      baseUrl: 'http://localhost:7780',
      modules: getAppModules()
    });
  });

  after(function() {
    return t.destroy(apos);
  });

  afterEach(function() {
    apos.doc.db.deleteMany({
      title: 'topic 1',
      type: 'topic'
    });
  });

  it('should have instantiated properly the scheduled publishing module and have update task', function() {
    assert(apos.scheduledPub);
    assert(apos.scheduledPub.tasks.update);
  });

  it('should set a publishing date in the past and publish it when running the task', async function () {
    const { draftReq, req } = getReqs(apos);
    const date = new Date();

    const topic = {
      ...apos.topic.newInstance(),
      title: 'topic 1',
      scheduledPublish: date.toISOString()
    };

    const inserted = await apos.topic.insert(draftReq, topic);

    assert(inserted);
    assert(inserted.title === 'topic 1');

    const unpublishedTopic = await apos.topic.find(draftReq, {
      title: 'topic 1',
      aposMode: 'published'
    }).toObject();

    assert(!unpublishedTopic);

    await apos.task.invoke('@apostrophecms-pro/scheduled-publishing:update');

    const publishedTopic = await apos.topic.find(req, {
      title: 'topic 1',
      aposMode: 'published'
    }).toObject();

    assert(publishedTopic);
  });

  it('should update an already existing document if the publishing is scheduled in the past', async function () {
    const { draftReq, req } = getReqs(apos);

    const topic = {
      ...apos.topic.newInstance(),
      title: 'topic 1'
    };

    const draftDoc = await apos.topic.insert(draftReq, topic);

    assert(draftDoc);
    assert(draftDoc.title === 'topic 1');
    assert(draftDoc.aposMode === 'draft');

    await apos.doc.publish(draftReq, draftDoc);

    const publishedDoc = await apos.topic.find(req, {
      title: 'topic 1',
      aposMode: 'published'
    }).toObject();

    assert(publishedDoc);

    const docToUpdate = {
      ...draftDoc,
      title: 'topic 1 updated',
      scheduledPublish: (new Date()).toISOString()
    };

    const draftUpdated = await apos.topic.update(draftReq, docToUpdate);

    assert(draftUpdated);
    assert(draftUpdated.title === 'topic 1 updated');

    await apos.task.invoke('@apostrophecms-pro/scheduled-publishing:update');

    const updatedPublished = await apos.topic.find(req, {
      aposDocId: draftDoc.aposDocId,
      aposMode: 'published'
    }).toObject();

    assert(updatedPublished);
    assert(updatedPublished.title === 'topic 1 updated');
  });

  it('should set a publishing date in the future and not publish it when running the task', async function () {
    const { draftReq, req } = getReqs(apos);

    const date = new Date();
    date.setHours(date.getHours() + 1);

    const topic = {
      ...apos.topic.newInstance(),
      title: 'topic 1',
      scheduledPublish: date.toISOString()
    };

    const draftDoc = await apos.topic.insert(draftReq, topic);

    assert(draftDoc);
    assert(draftDoc.title === 'topic 1');

    await apos.task.invoke('@apostrophecms-pro/scheduled-publishing:update');

    const publishedTopic = await apos.topic.find(req, {
      title: 'topic 1',
      aposMode: 'published'
    }).toObject();

    assert(!publishedTopic);
  });

  it('should set a publishing date in the future and not update it when running the task', async function () {
    const { draftReq, req } = getReqs(apos);

    const topic = {
      ...apos.topic.newInstance(),
      title: 'topic 1'
    };

    const draftDoc = await apos.topic.insert(draftReq, topic);

    assert(draftDoc);
    assert(draftDoc.title === 'topic 1');
    assert(draftDoc.aposMode === 'draft');

    await apos.doc.publish(draftReq, draftDoc);

    const publishedDoc = await apos.topic.find(req, {
      title: 'topic 1',
      aposMode: 'published'
    }).toObject();

    assert(publishedDoc);

    const date = new Date();
    date.setHours(date.getHours() + 1);

    const docToUpdate = {
      ...draftDoc,
      title: 'topic 1 updated',
      scheduledPublish: date.toISOString()
    };

    const draftUpdated = await apos.topic.update(draftReq, docToUpdate);

    assert(draftUpdated);
    assert(draftUpdated.title === 'topic 1 updated');

    await apos.task.invoke('@apostrophecms-pro/scheduled-publishing:update');

    const updatedPublished = await apos.topic.find(req, {
      aposDocId: draftDoc.aposDocId,
      aposMode: 'published'
    }).toObject();

    assert(updatedPublished);
    assert(updatedPublished.title === 'topic 1');
  });
});

function getReqs(apos) {
  return {
    draftReq: apos.task.getReq({
      mode: 'draft'
    }),
    req: apos.task.getReq()
  };
}

function getAppModules() {
  return {
    '@apostrophecms/express': {
      options: {
        port: 7780,
        session: { secret: 'supersecret' }
      }
    },
    '@apostrophecms-pro/scheduled-publishing': {
      options: {
        alias: 'scheduledPub'
      }
    },
    'default-page': {
      extend: '@apostrophecms/page-type'
    },
    topic: {
      extend: '@apostrophecms/piece-type',
      options: {
        alias: 'topic'
      }
    }
  };
}
