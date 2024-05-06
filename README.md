# ShinyColorsDB-EventViewer
A simple viewer that renders shinycolors events

[demo website](https://event.shinycolors.moe/?eventId=202100711)

## Accessing Events?

for produce/support events use query variable `eventId={number}`

for other events, specify query variable eventType `eventId={number}&eventType={type}`

    business_unit_communication
    produce_communication_auditions
    produce_communication_promise_results
    produce_communication_televisions
    support_skills
    game_event_communications
    produce_communication_cheers
    produce_communications
    produce_events
    mypage_communications
    produce_communication_judges
    produce_communications_promises
    special_communications

![](./assets/demo.png)

for iframe embed
- Read custom event json
```json
{
    "messageType": "iframeJson",
    "ifarameJson": [...]
}
```
- Jump to specific frame
```json
{
    "messageType": "fastForward",
    "fastForward": {
        "forward": true,
        "target": 2
    }
}
```

- Clear fast forward and back to first frame
```json
{
    "messageType": "fastForward",
    "fastForward": {
        "forward": false
    }
}
```