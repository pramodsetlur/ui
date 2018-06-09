import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { set, get, observer } from '@ember/object';

export default Component.extend({
  layout,

  globalStore: service(),
  scope: service(),

  events: null,

  sortBy: 'lastTimestamp',
  descending: false,
  name: null,
  namespaceId: null,
  resourceType: null,
  expanded: false,
  timeOutAnchor: null,
  loading: false,

  init() {
    this._super(...arguments);
    this.expanedDidChange();
  },

  expanedDidChange: observer('expanded', function() {
    if ( get(this, 'expanded') ) {
      set(this, 'loading', true);
      this.fetchEvents();
    } else {
      this.clearTimeOut();
    }
  }),

  fetchEvents: function() {
    get(this, 'globalStore').rawRequest({
      url: `/k8s/clusters/${get(this, 'scope.currentCluster.id')}/api/v1/namespaces/${get(this, 'namespaceId')}/events?fieldSelector=involvedObject.name=${get(this, 'name')}`,
      method: 'GET',
    }).then((xhr) => {
      set(this, 'events', xhr.body.items);
      set(this, 'loading', false);
      const timeOutAnchor = setTimeout(()=>{
        this.fetchEvents();
      },10000);
      set(this, 'timeOutAnchor', timeOutAnchor);
    });
  },

  headers: [
    {
      name: 'type',
      sort: ['type'],
      translationKey: 'resourceEventList.table.type',
      width: 100,
    },
    {
      name: 'reason',
      sort: ['reason'],
      translationKey: 'resourceEventList.table.reason',
      width: 200,
    },
    {
      name: 'message',
      sort: ['message'],
      translationKey: 'resourceEventList.table.message',
    },
    {
      name: 'lastTimestamp',
      sort: ['lastTimestamp'],
      translationKey: 'conditionSections.table.lastUpdate',
      width: 200,
    },
  ],

  clearTimeOut: function() {
    const timeOutAnchor = get(this, 'timeOutAnchor');
    if(timeOutAnchor){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

  willDestroyElement: function() {
    this.clearTimeOut();
    this._super();
  },
});
