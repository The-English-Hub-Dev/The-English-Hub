const { Listener, Store, Piece, Events } = require("@sapphire/framework");

class PiecePostLoadListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "piecePostLoad",
      event: Events.PiecePostLoad,
    });
  }

  /**
   *
   * @param { Store } store
   * @param { Piece } piece
   */
  run(store, piece) {
    this.container.logger.info(
      `Loaded command ${piece.name} into store ${store.name}`
    );
  }
}

module.exports = { PiecePostLoadListener };
