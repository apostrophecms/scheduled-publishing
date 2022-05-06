module.exports = {
  improve: '@apostrophecms/doc-type',
  fields(self) {
    if (self.options.autopublish || self.options.localized === false) {
      return;
    }

    return {
      add: {
        scheduledPublish: {
          // TODO: use datetime
          type: 'date',
          label: 'scheduledPublish',
          publishedLabel: 'scheduledUpdate'
        },
        scheduledUnpublish: {
          // TODO: use datetime
          type: 'date',
          label: 'scheduledUnpublish'
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
