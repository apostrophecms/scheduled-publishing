const fs = require('fs');
const path = require('path');

module.exports = {
  bundle: {
    directory: 'modules',
    modules: getBundleModuleNames()
  },
  tasks(self, options) {
    return {
      update: {
        usage: 'Updates documents based on scheduled publishing.',
        async task(argv) {
          const locales = Object.keys(self.apos.i18n.locales);

          const currentDate = new Date();

          for (const locale of locales) {
            const req = self.apos.task.getReq({
              locale,
              mode: 'draft'
            });

            await self.publishDocs(req, currentDate);

            await self.unpublishDocs(req, currentDate);
          }
        }
      }
    };
  },
  methods (self) {
    return {
      async publishDocs(req, currentDate) {
        const docs = await self.apos.doc.find(req, {
          scheduledPublish: {
            $lte: currentDate.toISOString()
          }
        }).sort({ level: 1 })
          .toArray();

        for (const doc of docs) {
          try {
            const updatedDoc = {
              ...doc,
              scheduledPublish: null
            };

            await self.apos.doc.publish(req, updatedDoc);
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $set: {
                scheduledPublish: null
              }
            });
          } catch (err) {
            self.apos.util.error(err);
          }
        }
      },
      async unpublishDocs(req, currentDate) {
        const docs = await self.apos.doc.find(req, {
          scheduledUnpublish: {
            $lte: currentDate.toISOString()
          }
        })
          .sort({ level: -1 })
          .toArray();

        for (const doc of docs) {
          try {
            const updatedDoc = {
              ...doc,
              scheduledUnpublish: null
            };

            await self.apos.doc.unpublish(req, updatedDoc);
            await self.apos.doc.db.updateOne({
              _id: doc._id
            }, {
              $set: {
                scheduledUnpublish: null
              }
            });
          } catch (err) {
            self.apos.util.error(err);
          }
        }
      }
    };
  }
};

function getBundleModuleNames() {
  const source = path.join(__dirname, './modules/@apostrophecms-pro');
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => `@apostrophecms-pro/${dirent.name}`);
}
