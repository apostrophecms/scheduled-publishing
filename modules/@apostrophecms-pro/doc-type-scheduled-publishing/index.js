module.exports = {
  improve: '@apostrophecms/doc-type',
  fields(self) {
    if (self.options.autopublish || self.options.localized === false) {
      return;
    }

    return {
      add: {
        scheduledPublish: {
          type: 'dateAndTime',
          label: 'apostrophe:scheduledPublish',
          publishedLabel: 'apostrophe:scheduledUpdate',
          permission: {
            action: 'publish'
          }
        },
        scheduledUnpublish: {
          type: 'dateAndTime',
          label: 'apostrophe:scheduledUnpublish',
          permission: {
            action: 'publish'
          }
        }
      },
      group: {
        utility: {
          fields: [
            'scheduledPublish',
            'scheduledUnpublish'
          ]
        }
      }
    };
  }
};
