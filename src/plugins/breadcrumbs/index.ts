import { Config } from 'payload/config';
import { Options } from './types';
import createBreadcrumbsField from './fields/breadcrumbs';
import createParentField from './fields/parent';
import populateBreadcrumbs from './populateBreadcrumbs';
import resaveChildren from './hooks/resaveChildren';


const breadcrumbs = (options: Options) => (config: Config): Config => ({
  ...config,
  collections: (config.collections || []).map((collection) => {
    if (options.collections.indexOf(collection.slug) > -1) {
      const fields = [...collection?.fields || []];

      if (!options.parentFieldSlug) {
        fields.push(createParentField(collection.slug));
      }

      if (!options.breadcrumbsFieldSlug) {
        fields.push(createBreadcrumbsField(collection.slug));
      }

      return {
        ...collection,
        hooks: {
          ...collection.hooks || {},
          beforeChange: [
            async ({ req, data }) => populateBreadcrumbs(req, options, collection, data),
            ...collection?.hooks?.beforeChange || [],
          ],
          afterChange: [
            resaveChildren(options, collection),
          ],
        },
        fields,
      };
    }

    return collection;
  }),
});

export default breadcrumbs;
