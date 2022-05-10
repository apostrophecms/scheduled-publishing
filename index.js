const fs = require('fs');
const path = require('path');
// const dayjs = require('dayjs')

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
          // Get an req object with admin privileges. You can also use getAnonReq.
          
          const locales = Object.keys(self.apos.i18n.locales)
          
          const currentDate = new Date()

          for (const locale of locales) {
            const req = self.apos.task.getReq({
              locale
            });

            const docs = await self.apos.doc.find(req, {
              scheduledPublish: {
                $lte: currentDate
              }
            }).toArray()

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
