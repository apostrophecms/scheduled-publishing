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
          publishedLabel: 'apostrophe:scheduledUpdate'
        },
        scheduledUnpublish: {
          type: 'dateAndTime',
          label: 'apostrophe:scheduledUnpublish'
        }
      },
      group: {
        utility: {
          fields: [
            'slug',
            'visibility',
            'scheduledPublish',
            'scheduledUnpublish'
          ]
        }
      }
    };
  }
};
