<a name="config"></a>

## config() ⇒ <code>object</code>
The following environment variables are needed to configure H2Feeds:

| Env variable name | Description | Default | Comments |
| ----------------- | ----------- | ------- | -------- |
| TABLE_NAME_FEED | Table for H2Feeds service | Feed | on dynamodb
| TABLE_NAME_FEED_RESPONSE | Table for H2Feeds service | FeedResponse | on dynamodb
| TABLE_NAME_FEED_USER | Table for H2Feeds service | FeedUser | on dynamodb
| OAUTH_IMPLICIT_AUDIENCE | audience of the service for token validation | |
| OAUTH_IMPLICIT_KEY | key to verify user token | |
| OAUTH_IMPLICIT_ISSUER | issuer of user token (mID) | |
| TOPIC_NAME | Topic name to subscribe to for sending events |
| MPO_URL | mPO url to get user profile references | |
| MPO_AUDIENCE | mPO audience | |
| MSHADOWFEED_SET | set to `on` if shadow feed service is available | `off` |
| MSHADOWFEED_AUDIENCE | mShadowFeed service audience | |

These values are on top of what is needed in the [configuration](https://bitbucket.org/mimiktech/configuration) library.

The api is in [swaggerhub](https://app.swaggerhub.com/apis/mimik/H2Feeds)

* `Feed`: contains the feed created by system
* `FeedResponse`: contains the responses to feeds by the user associated
* `FeedUser`: contains the user feed profile

**Kind**: global function  
**Returns**: <code>object</code> - configuration - Server configuration.  
