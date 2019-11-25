const express = require("express");
const app = express();
app.use(express.json());
const {isIn, regex, send, del} = require("./utils");

app.get("/", (req,res) => {
	res.send("Thanks for keeping me alive fellow policer!")
});

app.post("/events", (req, res) => {
	if (req.body.event.channel != "C0P5NE354") { res.end() }

	if (req.body.event.type == "message" && req.body.event.text) {
		let {ts, text, user, channel} = req.body.event;
		var emojis = text.match(regex);
		if (emojis) {
			emojis.map((emoji) => {
				isIn(emoji,user)
					.then((is) => {
						if (is) {
							send(process.env.LOGS,`<@${user}> has used an emoji in a message the wrong way! The message was \`${text}\` in channel <#${channel}>`)
							send(channel,"This message has been removed for using a restricted emoji!",ts)
								.then(() => {
									send(user,`Your message \`${text}\` was taken down in violation of using the restricted emoji ${emoji}!` )
									del(ts,channel);
								})
						}
					})
			})
		} 
	} else if (req.body.event.type == "reaction_added"){
		console.log(req.body.event)
		let {user, reaction} = req.body.event;
		isIn(`:${reaction}:`,user)
			.then((is) => {
				if (is) {
					send(process.env.LOGS,`<@${user}> has used an emoji in a reaction the wrong way! The emoji was :${reaction}: in channel <#${req.body.event.item.channel}>`)
					send(user,`A reaction you posted has had a restricted emoji. The admin's will be contacted. The emoji you used was :${reaction}:!`);
				}
			})
	}
	res.send(req.body.challenge)
});


const listener = app.listen(process.env.PORT, function () {
  console.log("Badger is listening on port " + listener.address().port);
});