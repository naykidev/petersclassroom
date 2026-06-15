<?php
/**
 * Plugin Name: Axolo Assist Toolbar
 * Description: Floating accessibility toolbar with text size, spacing, contrast, color filters, reading aids, and motion controls for any WordPress theme.
 * Version: 1.0.0
 * Author: Axolo Assist
 * Author URI: https://axoloassist.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: axolo-assist-toolbar
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AAT_VERSION', '1.0.0' );
define( 'AAT_PLUGIN_FILE', __FILE__ );
define( 'AAT_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AAT_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Default plugin settings.
 *
 * @return array<string, mixed>
 */
function aat_default_settings() {
	return array(
		'accent_color' => '#B03060',
		'features'     => array(
			'text_size'          => true,
			'line_spacing'       => true,
			'letter_spacing'     => true,
			'font'               => true,
			'contrast'           => true,
			'color_filter'       => true,
			'underline_links'    => true,
			'enhanced_focus'     => true,
			'highlight_headings' => true,
			'reading_guide'      => true,
			'reduce_motion'      => true,
			'pause_animations'   => true,
			'big_cursor'         => true,
		),
	);
}

/**
 * @return array<string, mixed>
 */
function aat_get_settings() {
	$defaults = aat_default_settings();
	$saved    = get_option( 'axolo_assist_toolbar_settings', array() );

	if ( ! is_array( $saved ) ) {
		$saved = array();
	}

	$features = isset( $saved['features'] ) && is_array( $saved['features'] )
		? array_merge( $defaults['features'], $saved['features'] )
		: $defaults['features'];

	$accent = isset( $saved['accent_color'] ) ? sanitize_hex_color( $saved['accent_color'] ) : '';
	if ( ! $accent ) {
		$accent = $defaults['accent_color'];
	}

	return array(
		'accent_color' => $accent,
		'features'     => $features,
	);
}

/**
 * @param string $hex
 * @return string
 */
function aat_hex_to_rgb( $hex ) {
	$hex = ltrim( $hex, '#' );
	if ( strlen( $hex ) === 3 ) {
		$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}
	return sprintf(
		'%d, %d, %d',
		hexdec( substr( $hex, 0, 2 ) ),
		hexdec( substr( $hex, 2, 2 ) ),
		hexdec( substr( $hex, 4, 2 ) )
	);
}

/**
 * @param string $feature
 * @return bool
 */
function aat_feature_enabled( $feature ) {
	$settings = aat_get_settings();
	return ! empty( $settings['features'][ $feature ] );
}

add_action( 'admin_init', 'aat_register_settings' );
function aat_register_settings() {
	register_setting(
		'axolo_assist_toolbar',
		'axolo_assist_toolbar_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'aat_sanitize_settings',
			'default'           => aat_default_settings(),
		)
	);
}

/**
 * @param mixed $input
 * @return array<string, mixed>
 */
function aat_sanitize_settings( $input ) {
	$defaults = aat_default_settings();
	$output   = $defaults;

	if ( ! is_array( $input ) ) {
		return $output;
	}

	$accent = isset( $input['accent_color'] ) ? sanitize_hex_color( $input['accent_color'] ) : '';
	if ( $accent ) {
		$output['accent_color'] = $accent;
	}

	if ( isset( $input['features'] ) && is_array( $input['features'] ) ) {
		foreach ( $defaults['features'] as $key => $default_on ) {
			$output['features'][ $key ] = ! empty( $input['features'][ $key ] );
		}
	}

	return $output;
}

add_action( 'admin_menu', 'aat_add_settings_page' );
function aat_add_settings_page() {
	add_options_page(
		__( 'Axolo Assist Toolbar', 'axolo-assist-toolbar' ),
		__( 'Axolo Assist Toolbar', 'axolo-assist-toolbar' ),
		'manage_options',
		'axolo-assist-toolbar',
		'aat_render_settings_page'
	);
}

function aat_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings = aat_get_settings();
	$labels   = array(
		'text_size'          => __( 'Text size', 'axolo-assist-toolbar' ),
		'line_spacing'       => __( 'Line spacing', 'axolo-assist-toolbar' ),
		'letter_spacing'     => __( 'Letter spacing', 'axolo-assist-toolbar' ),
		'font'               => __( 'Font picker', 'axolo-assist-toolbar' ),
		'contrast'           => __( 'Contrast modes', 'axolo-assist-toolbar' ),
		'color_filter'       => __( 'Color filter', 'axolo-assist-toolbar' ),
		'underline_links'    => __( 'Underline links', 'axolo-assist-toolbar' ),
		'enhanced_focus'     => __( 'Enhanced focus', 'axolo-assist-toolbar' ),
		'highlight_headings' => __( 'Highlight headings', 'axolo-assist-toolbar' ),
		'reading_guide'      => __( 'Reading guide', 'axolo-assist-toolbar' ),
		'reduce_motion'      => __( 'Reduce motion', 'axolo-assist-toolbar' ),
		'pause_animations'   => __( 'Pause animations', 'axolo-assist-toolbar' ),
		'big_cursor'         => __( 'Large cursor', 'axolo-assist-toolbar' ),
	);
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form action="options.php" method="post">
			<?php settings_fields( 'axolo_assist_toolbar' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="aat-accent-color"><?php esc_html_e( 'Accent color', 'axolo-assist-toolbar' ); ?></label>
					</th>
					<td>
						<input type="color" id="aat-accent-color" name="axolo_assist_toolbar_settings[accent_color]" value="<?php echo esc_attr( $settings['accent_color'] ); ?>" />
						<p class="description"><?php esc_html_e( 'Used for active buttons, switches, and focus rings in the toolbar.', 'axolo-assist-toolbar' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Toolbar features', 'axolo-assist-toolbar' ); ?></th>
					<td>
						<fieldset>
							<legend class="screen-reader-text"><?php esc_html_e( 'Toolbar features', 'axolo-assist-toolbar' ); ?></legend>
							<?php foreach ( $labels as $key => $label ) : ?>
								<label style="display:block;margin-bottom:.45rem;">
									<input type="checkbox" name="axolo_assist_toolbar_settings[features][<?php echo esc_attr( $key ); ?>]" value="1" <?php checked( ! empty( $settings['features'][ $key ] ) ); ?> />
									<?php echo esc_html( $label ); ?>
								</label>
							<?php endforeach; ?>
						</fieldset>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

add_action( 'wp_enqueue_scripts', 'aat_enqueue_assets' );
function aat_enqueue_assets() {
	if ( is_admin() ) {
		return;
	}

	wp_enqueue_style(
		'axolo-assist-toolbar',
		AAT_PLUGIN_URL . 'toolbar.css',
		array(),
		AAT_VERSION
	);

	$settings = aat_get_settings();
	$rgb      = aat_hex_to_rgb( $settings['accent_color'] );
	$inline   = sprintf(
		':root { --aat-accent: %1$s; --aat-accent-rgb: %2$s; --aat-accent-deep: %1$s; --aat-accent-tint: rgba(%2$s, 0.12); --aat-accent-tint2: rgba(%2$s, 0.28); }',
		esc_attr( $settings['accent_color'] ),
		esc_attr( $rgb )
	);
	wp_add_inline_style( 'axolo-assist-toolbar', $inline );

	wp_enqueue_script(
		'axolo-assist-toolbar',
		AAT_PLUGIN_URL . 'toolbar.js',
		array(),
		AAT_VERSION,
		true
	);

	wp_localize_script(
		'axolo-assist-toolbar',
		'axoloAssistToolbar',
		array(
			'pluginUrl'   => AAT_PLUGIN_URL,
			'iconUrl'     => AAT_PLUGIN_URL . 'assets/accessibility.png',
			'fontBaseUrl' => AAT_PLUGIN_URL . 'assets/fonts/',
			'storageKey'  => 'pc-a11y-settings-v1',
			'features'    => $settings['features'],
		)
	);
}

add_action( 'wp_footer', 'aat_render_toolbar', 20 );
function aat_render_toolbar() {
	if ( is_admin() ) {
		return;
	}

	$icon_url = esc_url( AAT_PLUGIN_URL . 'assets/accessibility.png' );
	?>
	<div class="axolo-toolbar-root" id="axoloAssistToolbarRoot">
		<button class="a11y-toggle" id="a11yToggle" type="button" aria-label="<?php esc_attr_e( 'Open accessibility settings', 'axolo-assist-toolbar' ); ?>" aria-expanded="false" aria-controls="a11yPanel">
			<img src="<?php echo $icon_url; ?>" alt="" width="60" height="60" aria-hidden="true" />
		</button>
		<div class="a11y-overlay" id="a11yOverlay" aria-hidden="true"></div>
		<aside class="a11y-panel" id="a11yPanel" role="dialog" aria-labelledby="a11yTitle" aria-modal="true" tabindex="-1">
			<div class="a11y-panel-header">
				<h2 id="a11yTitle"><?php esc_html_e( 'Accessibility', 'axolo-assist-toolbar' ); ?></h2>
				<button class="a11y-close" id="a11yClose" type="button" aria-label="<?php esc_attr_e( 'Close accessibility settings', 'axolo-assist-toolbar' ); ?>">✕</button>
			</div>

			<?php if ( aat_feature_enabled( 'text_size' ) ) : ?>
			<div class="a11y-group" data-feature="text_size">
				<h3><?php esc_html_e( 'Text Size', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Text size', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="text-size" data-value="default" aria-pressed="true">A</button>
					<button class="a11y-btn" type="button" data-setting="text-size" data-value="lg" aria-pressed="false" style="font-size:0.95rem;">A+</button>
					<button class="a11y-btn" type="button" data-setting="text-size" data-value="xl" aria-pressed="false" style="font-size:1.05rem;">A++</button>
					<button class="a11y-btn" type="button" data-setting="text-size" data-value="xxl" aria-pressed="false" style="font-size:1.15rem;">A+++</button>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( aat_feature_enabled( 'line_spacing' ) ) : ?>
			<div class="a11y-group" data-feature="line_spacing">
				<h3><?php esc_html_e( 'Line Spacing', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Line spacing', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="line-spacing" data-value="default" aria-pressed="true"><?php esc_html_e( 'Normal', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="line-spacing" data-value="wide" aria-pressed="false"><?php esc_html_e( 'Wide', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="line-spacing" data-value="wider" aria-pressed="false"><?php esc_html_e( 'Wider', 'axolo-assist-toolbar' ); ?></button>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( aat_feature_enabled( 'letter_spacing' ) ) : ?>
			<div class="a11y-group" data-feature="letter_spacing">
				<h3><?php esc_html_e( 'Letter Spacing', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Letter spacing', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="letter-spacing" data-value="default" aria-pressed="true"><?php esc_html_e( 'Normal', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="letter-spacing" data-value="wide" aria-pressed="false"><?php esc_html_e( 'Wide', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="letter-spacing" data-value="wider" aria-pressed="false"><?php esc_html_e( 'Wider', 'axolo-assist-toolbar' ); ?></button>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( aat_feature_enabled( 'font' ) ) : ?>
			<div class="a11y-group" data-feature="font">
				<h3><?php esc_html_e( 'Font', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Font choice', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="font" data-value="default" aria-pressed="true"><?php esc_html_e( 'Default', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="font" data-value="dyslexia" aria-pressed="false"><?php esc_html_e( 'Dyslexia-friendly', 'axolo-assist-toolbar' ); ?></button>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( aat_feature_enabled( 'contrast' ) ) : ?>
			<div class="a11y-group" data-feature="contrast">
				<h3><?php esc_html_e( 'Contrast', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Contrast mode', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="contrast" data-value="default" aria-pressed="true"><?php esc_html_e( 'Normal', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="contrast" data-value="dark" aria-pressed="false"><?php esc_html_e( 'Dark', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="contrast" data-value="high" aria-pressed="false"><?php esc_html_e( 'High', 'axolo-assist-toolbar' ); ?></button>
				</div>
			</div>
			<?php endif; ?>

			<?php if ( aat_feature_enabled( 'color_filter' ) ) : ?>
			<div class="a11y-group" data-feature="color_filter">
				<h3><?php esc_html_e( 'Color Filter', 'axolo-assist-toolbar' ); ?></h3>
				<div class="a11y-options" role="group" aria-label="<?php esc_attr_e( 'Color filter', 'axolo-assist-toolbar' ); ?>">
					<button class="a11y-btn" type="button" data-setting="saturation" data-value="default" aria-pressed="true"><?php esc_html_e( 'None', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="saturation" data-value="grayscale" aria-pressed="false"><?php esc_html_e( 'Gray', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="saturation" data-value="sepia" aria-pressed="false"><?php esc_html_e( 'Muted', 'axolo-assist-toolbar' ); ?></button>
					<button class="a11y-btn" type="button" data-setting="saturation" data-value="inverted" aria-pressed="false"><?php esc_html_e( 'Invert', 'axolo-assist-toolbar' ); ?></button>
				</div>
			</div>
			<?php endif; ?>

			<?php
			$motion_features = array(
				'underline_links'    => array( 'underline-links', __( 'Underline links', 'axolo-assist-toolbar' ), __( 'Underline all links', 'axolo-assist-toolbar' ) ),
				'enhanced_focus'     => array( 'enhanced-focus', __( 'Enhanced focus', 'axolo-assist-toolbar' ), __( 'Enhanced focus indicators', 'axolo-assist-toolbar' ) ),
				'highlight_headings' => array( 'highlight-headings', __( 'Highlight headings', 'axolo-assist-toolbar' ), __( 'Highlight headings', 'axolo-assist-toolbar' ) ),
				'reading_guide'      => array( 'reading-guide', __( 'Reading guide', 'axolo-assist-toolbar' ), __( 'Reading guide bar that follows the cursor', 'axolo-assist-toolbar' ) ),
				'reduce_motion'      => array( 'reduce-motion', __( 'Reduce motion', 'axolo-assist-toolbar' ), __( 'Reduce motion and animations', 'axolo-assist-toolbar' ) ),
				'pause_animations'   => array( 'pause-animations', __( 'Pause animations', 'axolo-assist-toolbar' ), __( 'Pause all animations', 'axolo-assist-toolbar' ) ),
				'big_cursor'         => array( 'big-cursor', __( 'Large cursor', 'axolo-assist-toolbar' ), __( 'Enlarge cursor', 'axolo-assist-toolbar' ) ),
			);
			$motion_enabled = false;
			foreach ( $motion_features as $feature_key => $data ) {
				if ( aat_feature_enabled( $feature_key ) ) {
					$motion_enabled = true;
					break;
				}
			}
			if ( $motion_enabled ) :
				?>
			<div class="a11y-group" data-feature="reading_motion">
				<h3><?php esc_html_e( 'Reading & Motion', 'axolo-assist-toolbar' ); ?></h3>
				<?php
				foreach ( $motion_features as $feature_key => $data ) :
					if ( ! aat_feature_enabled( $feature_key ) ) {
						continue;
					}
					list( $toggle_id, $label, $aria_label ) = $data;
					?>
				<div class="a11y-toggle-row">
					<label for="sw-<?php echo esc_attr( $toggle_id ); ?>"><?php echo esc_html( $label ); ?></label>
					<button class="a11y-switch" id="sw-<?php echo esc_attr( $toggle_id ); ?>" type="button" data-toggle="<?php echo esc_attr( $toggle_id ); ?>" role="switch" aria-checked="false" aria-label="<?php echo esc_attr( $aria_label ); ?>"></button>
				</div>
					<?php
				endforeach;
				?>
			</div>
			<?php endif; ?>

			<button class="a11y-reset" id="a11yReset" type="button"><?php esc_html_e( 'Reset all settings', 'axolo-assist-toolbar' ); ?></button>
		</aside>
	</div>
	<?php
}
